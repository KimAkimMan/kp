"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
import { Program, User, AdviceRecord, PageType, FieldSurvey } from "./types";
import { SurveyStatus } from "@/generated/prisma/enums";
import { initialPrograms, initialUsers, initialSurveys } from "./data/initialData";
import { ApiClientError, adviceApi, authApi, programApi, surveyApi, userApi } from "@/lib/api";
import {
  mapApiAdviceToAdvice,
  mapApiProgramToProgram,
  mapApiSurveyToSurvey,
  mapApiUserToUser,
} from "./utils/api-mappers";
import {
  operatorAssignment,
  isAssignedToCurrentOperator,
} from "./utils/helpers";

import { PublicLanding } from "./components/PublicLanding";
import { LoginScreen } from "./components/LoginScreen";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { Toast } from "./components/Toast";

import { DashboardView } from "./components/views/DashboardView";
import { UsersView } from "./components/views/UsersView";
import { MasterActivitiesView } from "./components/views/MasterActivitiesView";
import { ProgramsView } from "./components/views/ProgramsView";
import { SurveyView } from "./components/views/SurveyView";
import { AdminSurveyView } from "./components/views/AdminSurveyView";
import { ScheduleView } from "./components/views/ScheduleView";
import { HistoryView } from "./components/views/HistoryView";
import { ReportsView } from "./components/views/ReportsView";
import { DetailView } from "./components/views/DetailView";
import { MasterActivityDetailView } from "./components/views/MasterActivityDetailView";
import { ProfileView } from "./components/views/ProfileView";

import {
  UserModal,
  ActivityModal,
  ScheduleModal,
  CostModal,
} from "./components/Modals";

export default function Home() {
  // Navigation & Screen states
  const [screen, setScreen] = useState<"landing" | "login" | "app">("landing");
  const [currentPage, setCurrentPage] = useState<PageType>("dashboard");
  const [previousPage, setPreviousPage] = useState<PageType>("programs");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<number>(1);
  const [targetAdviceProgramId, setTargetAdviceProgramId] = useState<number | null>(null);

  // Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(initialUsers);

  // Data state with persistence (initialized with initialData for SSR hydration consistency)
  const [programs, setPrograms] = useState<Program[]>(initialPrograms);
  const [adviceRecords, setAdviceRecords] = useState<AdviceRecord[]>([]);
  const [surveys, setSurveys] = useState<FieldSurvey[]>(initialSurveys);
  const [toast, setToast] = useState<{
    message: string | null;
    type?: "success" | "error";
  }>({ message: null, type: "success" });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  const fetchAllPages = useCallback(async <T,>(
    loader: (page: number, pageSize: number) => Promise<{
      data: T[];
      meta: { page: number; totalPages: number };
    }>,
  ) => {
    const pageSize = 100;
    const items: T[] = [];
    let page = 1;
    let totalPages = 1;
    do {
      const response = await loader(page, pageSize);
      items.push(...response.data);
      totalPages = response.meta.totalPages;
      page += 1;
    } while (page <= totalPages);
    return items;
  }, []);

  const refreshPrograms = useCallback(async () => {
    const response = await fetchAllPages((page, pageSize) =>
      programApi.list({ page, pageSize }),
    );
    setPrograms(response.map(mapApiProgramToProgram));
  }, [fetchAllPages]);

  const refreshUsers = useCallback(async () => {
    const response = await fetchAllPages((page, pageSize) =>
      userApi.list({ page, pageSize }),
    );
    setUsers(response.map(mapApiUserToUser));
  }, [fetchAllPages]);

  const refreshSurveys = useCallback(async () => {
    const response = await fetchAllPages((page, pageSize) =>
      surveyApi.list({ page, pageSize }),
    );
    setSurveys(response.map(mapApiSurveyToSurvey));
  }, [fetchAllPages]);

  const refreshAdvice = useCallback(async () => {
    const response = await fetchAllPages((page, pageSize) =>
      adviceApi.list({ page, pageSize }),
    );
    setAdviceRecords(response.map(mapApiAdviceToAdvice));
  }, [fetchAllPages]);

  useEffect(() => {
    if (!currentUser) return;

    let cancelled = false;
    void (async () => {
      try {
        const [programItems, surveyItems, adviceItems] = await Promise.all([
          fetchAllPages((page, pageSize) => programApi.list({ page, pageSize })),
          fetchAllPages((page, pageSize) => surveyApi.list({ page, pageSize })),
          fetchAllPages((page, pageSize) => adviceApi.list({ page, pageSize })),
        ]);
        if (!cancelled) {
          setPrograms(programItems.map(mapApiProgramToProgram));
          setSurveys(surveyItems.map(mapApiSurveyToSurvey));
          setAdviceRecords(adviceItems.map(mapApiAdviceToAdvice));
          if (currentUser.role === "Admin") {
            const userItems = await fetchAllPages((page, pageSize) =>
              userApi.list({ page, pageSize }),
            );
            if (!cancelled) setUsers(userItems.map(mapApiUserToUser));
          }
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof ApiClientError
            ? error.message
            : "Daftar kegiatan gagal dimuat dari server.";
          showToast(message, "error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentUser, fetchAllPages]);

  // Pulihkan sesi aktif (cookie `kp_session`) agar refresh tidak memaksa login ulang
  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      try {
        const { data } = await authApi.me();
        if (cancelled) return;
        setCurrentUser((previous) => previous ?? mapApiUserToUser(data));
        setScreen((previous) => (previous === "landing" ? "app" : previous));
      } catch {
        // 401/UNAUTHENTICATED berarti belum (atau tidak lagi) login: tetap di landing.
      }
    };

    void restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  // Modals state
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Program | null>(null);
  const activitySubmitInFlight = useRef(false);

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [targetProgramForSchedule, setTargetProgramForSchedule] =
    useState<Program | null>(null);

  const [costModalOpen, setCostModalOpen] = useState(false);
  const [targetProgramForCost, setTargetProgramForCost] =
    useState<Program | null>(null);

  // Save / Update Survey Lapangan
  const handleSaveSurvey = async (survey: FieldSurvey) => {
    const kondisiMap: Record<FieldSurvey["kondisi"], "BAIK" | "RUSAK_RINGAN" | "RUSAK_SEDANG" | "RUSAK_BERAT"> = {
      Baik: "BAIK",
      "Rusak Ringan": "RUSAK_RINGAN",
      "Rusak Sedang": "RUSAK_SEDANG",
      "Rusak Berat": "RUSAK_BERAT",
    };
    const urgensiMap: Record<FieldSurvey["tingkatUrgensi"], "RENDAH" | "SEDANG" | "TINGGI_MENDESAK"> = {
      Rendah: "RENDAH",
      Sedang: "SEDANG",
      "Tinggi / Mendesak": "TINGGI_MENDESAK",
    };
    // Handle FieldSurvey Indonesian string status (from app/types.ts) -> Prisma SurveyStatus enum
    const statusStringToSurveyStatus: Record<string, SurveyStatus> = {
      Draft: SurveyStatus.DRAFT,
      "Selesai Survey": SurveyStatus.SELESAI_SURVEY,
      "Menunggu Verifikasi": SurveyStatus.MENUNGGU_VERIFIKASI,
      "Perlu Revisi": SurveyStatus.PERLU_REVISI,
      Diverifikasi: SurveyStatus.DIVERIFIKASI,
      Dikonversi: SurveyStatus.DIKONVERSI,
    };
    const parsedDate = survey.tanggal ? new Date(survey.tanggal) : new Date();
    const tanggal = Number.isNaN(parsedDate.getTime())
      ? new Date().toISOString().slice(0, 10)
      : parsedDate.toISOString().slice(0, 10);
    const input = {
      kodeSurvey: survey.kodeSurvey,
      tanggal,
      surveyor: survey.surveyor,
      surveyorId: survey.surveyorId ? Number(survey.surveyorId) : undefined,
      programId: survey.programId ?? null,
      namaKegiatan: survey.namaKegiatan,
      kategori: survey.kategori,
      kecamatan: survey.kecamatan,
      desaKelurahan: survey.desaKelurahan,
      detailLokasi: survey.detailLokasi,
      koordinat: survey.koordinat,
      kondisi: kondisiMap[survey.kondisi],
      panjang: survey.panjang,
      lebar: survey.lebar,
      luasVolume: survey.luasVolume,
      satuan: survey.satuan,
      tipeKonstruksi: survey.tipeKonstruksi,
      estimasiBiaya: survey.estimasiBiaya,
      tingkatUrgensi: urgensiMap[survey.tingkatUrgensi],
      uraianTemuan: survey.uraianTemuan,
      rekomendasi: survey.rekomendasi,
      kontakPendamping: survey.kontakPendamping,
      foto: survey.foto,
      fotoUrl: survey.fotoUrl,
      status: statusStringToSurveyStatus[survey.status] ?? SurveyStatus.MENUNGGU_VERIFIKASI,
    };
    try {
      const exists = surveys.some((s) => s.id === survey.id);
      if (exists) {
        await surveyApi.update(survey.id, input);
        showToast(`Data survey ${survey.kodeSurvey} berhasil diperbarui.`);
      } else {
        await surveyApi.create(input);
        showToast(`Survey lapangan ${survey.kodeSurvey} berhasil disimpan!`);
      }
      await refreshSurveys();
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : "Survey gagal disimpan.", "error");
    }
  };

  // Delete Survey Lapangan
  const handleDeleteSurvey = async (id: string) => {
    try {
      await surveyApi.remove(id);
      await refreshSurveys();
      showToast("Data survey berhasil dihapus.");
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : "Survey gagal dihapus.", "error");
    }
  };

  // Login handler
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setScreen("app");
    setCurrentPage("dashboard");
    showToast(`Selamat datang kembali, ${user.nama}!`);
  };

  // Logout handler
  const handleLogout = () => {
    // Hapus sesi server (cookie `kp_session`) tanpa memblokir perpindahan layar.
    void authApi.logout().catch(() => undefined);
    setCurrentUser(null);
    setScreen("landing");
    showToast("Anda telah keluar dari aplikasi.");
  };

  // Detail program navigation
  const handleViewProgram = (id: number) => {
    setSelectedProgramId(id);
    setPreviousPage(currentPage === "detail" ? "programs" : currentPage);
    setCurrentPage("detail");
  };

  const handleViewMasterActivity = (id: number) => {
    setSelectedProgramId(id);
    setCurrentPage("masteractivitydetail");
  };

  // Open schedule page for Operator
  const handleNavigateSchedulePage = (id: number) => {
    setSelectedProgramId(id);
    setCurrentPage("schedule");
  };

  // Claim program for Operator
  const handleClaimProgram = async (id: number) => {
    if (!currentUser || currentUser.role !== "Operator") return;
    const target = programs.find((p) => p.id === id);
    if (!target) return;

    const owner = operatorAssignment(target);
    if (owner && !isAssignedToCurrentOperator(target, currentUser)) {
      showToast("Kegiatan ini telah diambil oleh Operator lain.", "error");
      return;
    }
    try {
      await programApi.claim(id);
      await refreshPrograms();
      showToast("Kegiatan berhasil diambil. Anda dapat melengkapi datanya.");

      const claimed = (await programApi.get(id)).data;
      setTargetProgramForSchedule(
        mapApiProgramToProgram(claimed as unknown as Record<string, unknown>),
      );
      setScheduleModalOpen(true);
    } catch (error) {
      showToast(
        error instanceof ApiClientError
          ? error.message
          : "Kegiatan gagal diambil.",
        "error",
      );
    }
  };

  // Add / Edit User (Admin)
  const handleSaveUser = async (userData: Partial<User>) => {
    const password = userData.password;
    if (!editingUser && (!password || password.length < 8)) {
      showToast("Password pengguna baru minimal 8 karakter.", "error");
      return;
    }
    if (password && password.length < 8) {
      showToast("Password minimal 8 karakter.", "error");
      return;
    }
    try {
      if (editingUser) {
        await userApi.update(editingUser.id, {
          nama: userData.nama,
          email: userData.email,
          role: userData.role,
          ...(userData.password ? { password: userData.password } : {}),
        });
        showToast("Data pengguna berhasil diperbarui.");
      } else {
        await userApi.create({
          nama: userData.nama || "",
          email: userData.email || "",
          role: userData.role || "Operator",
          password: userData.password!,
        });
        showToast("Pengguna baru berhasil ditambahkan.");
      }
      await refreshUsers();
      setUserModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : "Pengguna gagal disimpan.", "error");
    }
  };

  // Delete User (Admin)
  const handleDeleteUser = async (user: User) => {
    try {
      await userApi.remove(user.id);
      await refreshUsers();
      showToast(`Pengguna ${user.nama} berhasil dihapus.`);
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : "Pengguna gagal dihapus.", "error");
    }
  };

  // Delete Master Activity (Admin)
  const handleDeleteActivity = async (program: Program) => {
    try {
      await programApi.remove(program.id);
      await refreshPrograms();
      showToast(`Kegiatan "${program.nama}" berhasil dihapus dari Master Kegiatan.`);
    } catch (error) {
      showToast(
        error instanceof ApiClientError
          ? error.message
          : "Kegiatan gagal dihapus.",
        "error",
      );
    }
  };

  // Add / Edit Master Activity (Admin)
  const handleSaveActivity = async (data: Partial<Program>) => {
    if (activitySubmitInFlight.current) return;
    activitySubmitInFlight.current = true;
    try {
      if (editingActivity) {
        await programApi.update(editingActivity.id, {
          nama: data.nama,
          namaKegiatan: data.nama,
          kategori: data.kategori,
          lokasi: data.lokasi,
          kecamatan: data.kecamatan,
          desaKelurahan: data.desaKelurahan,
          detailLokasi: data.detailLokasi,
          pagu: data.pagu,
          operatorPengelola: data.operatorPengelola,
          operatorPengelolaId: data.operatorPengelolaId === null
            ? null
            : data.operatorPengelolaId === undefined
              ? undefined
              : Number(data.operatorPengelolaId),
        });
        await refreshPrograms();
        showToast("Master kegiatan berhasil diperbarui.");
      } else {
        const uniqueSuffix = Math.random().toString(36).slice(-6);
        const kode = `PKP-2026-${uniqueSuffix}`;
        const idempotencyKey = `activity-create-${kode}-${data.nama?.trim().toLowerCase()}`;

        await programApi.create(
          {
            kode,
            nama: data.nama || "",
            namaKegiatan: data.nama || "",
            kategori: data.kategori || "Jalan Lingkungan",
            lokasi: data.lokasi || "Kabupaten Kuningan",
            kecamatan: data.kecamatan ?? null,
            desaKelurahan: data.desaKelurahan ?? null,
            detailLokasi: data.detailLokasi ?? null,
            operatorPengelola: data.operatorPengelola ?? null,
            operatorPengelolaId: data.operatorPengelolaId
              ? Number(data.operatorPengelolaId)
              : null,
            periode: "Januari–Desember 2026",
            satuan: "Unit",
            target: data.target ?? 0,
            pagu: data.pagu ?? 0,
          },
          { idempotencyKey },
        );

        await refreshPrograms();
        showToast(
          data.operatorPengelolaId
            ? "Master kegiatan baru berhasil ditugaskan."
            : "Master kegiatan baru berhasil tersedia untuk Operator.",
        );
      }
      setActivityModalOpen(false);
      setEditingActivity(null);
    } catch (error) {
      showToast(
        error instanceof ApiClientError
          ? error.message
          : "Master kegiatan gagal disimpan.",
        "error",
      );
    } finally {
      activitySubmitInFlight.current = false;
    }
  };

  // Convert Survey to Master Activity (Admin)
  const handleVerifySurvey = async (survey: FieldSurvey) => {
    try {
      await surveyApi.verify(survey.id, survey.programId ?? null);
      await refreshSurveys();
      showToast(`Survey ${survey.kodeSurvey} berhasil diverifikasi.`);
    } catch (error) {
      showToast(
        error instanceof ApiClientError ? error.message : "Verifikasi survey gagal.",
        "error",
      );
    }
  };

  const handleCreateProgramFromSurvey = async (
    survey: FieldSurvey,
    customData?: Partial<Program>
  ) => {
    if (survey.status !== "Diverifikasi") {
      showToast("Survey harus diverifikasi sebelum dikonversi menjadi kegiatan.", "error");
      return;
    }
    const newKode = `PKP-2026-${String(Date.now()).slice(-6)}`;
    try {
      await surveyApi.convert(survey.id, {
        kode: newKode,
        nama: customData?.nama || survey.namaKegiatan,
        periode: "Januari–Desember 2026",
        satuan: customData?.satuan || survey.satuan || "m2",
        target: customData?.target ?? survey.luasVolume ?? survey.panjang ?? 1,
        pagu: customData?.pagu ?? survey.estimasiBiaya ?? 0,
        operatorPengelolaId: customData?.operatorPengelolaId
          ? Number(customData.operatorPengelolaId)
          : null,
      });
      await Promise.all([refreshPrograms(), refreshSurveys()]);
      showToast(
        `Kegiatan baru dari survey "${survey.namaKegiatan}" berhasil dibuat di Master Kegiatan!`,
      );
      setCurrentPage("masteractivities");
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : "Konversi survey gagal.", "error");
    }
  };

  // Save Schedule / Technical Setup (Operator)
  const handleSaveSchedule = async (data: Partial<Program>) => {
    if (!targetProgramForSchedule) return;
    try {
      await programApi.update(targetProgramForSchedule.id, {
        nama: data.nama,
        namaKegiatan: data.namaKegiatan,
        kategori: data.kategori,
        lokasi: data.lokasi,
        kecamatan: data.kecamatan,
        desaKelurahan: data.desaKelurahan,
        detailLokasi: data.detailLokasi,
        satuan: data.satuan,
        target: data.target,
        targetAwal: data.targetAwal,
        targetVolume: data.targetVolume,
        pagu: data.pagu,
        penyedia: data.penyedia,
        direktur: data.direktur,
        nilaiKontrak: data.nilaiKontrak,
        noKontrak: data.noKontrak,
        jadwal: data.jadwal,
        lebarJalan: data.lebarJalan,
        kondisiJalan: data.kondisiJalan,
        tanggalMulai: data.tanggalMulai,
        tanggalSelesai: data.tanggalSelesai,
        status:
          targetProgramForSchedule.status === "Belum Dikerjakan" &&
          ((data.target || 0) > 0 || (data.targetVolume || 0) > 0)
            ? "SEDANG_DIKERJAKAN"
            : targetProgramForSchedule.status === "Sedang Dikerjakan"
              ? "SEDANG_DIKERJAKAN"
              : "BELUM_DIKERJAKAN",
      });
      await refreshPrograms();
      showToast("Data kegiatan dan target berhasil disimpan.");
      setScheduleModalOpen(false);
      setTargetProgramForSchedule(null);
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : "Data kegiatan gagal disimpan.", "error");
    }
  };

  // Save Progress & Realization (Operator)
  const handleSaveProgress = async (progressData: {
    tanggal: string;
    status: "Belum Dikerjakan" | "Sedang Dikerjakan" | "Selesai Dikerjakan";
    tahap: string;
    realisasi: number;
    catatan: string;
    hasPhoto: boolean;
    fotoUrls?: string[];
  }) => {
    try {
      await programApi.addProgress(selectedProgramId, {
        tanggal: progressData.tanggal,
        tahap: progressData.tahap,
        nilai: progressData.realisasi,
        satuan: programs.find((p) => p.id === selectedProgramId)?.satuan || "Unit",
        keterangan: progressData.catatan,
        foto: progressData.hasPhoto,
        status:
          progressData.status === "Selesai Dikerjakan"
            ? "SELESAI_DIKERJAKAN"
            : progressData.status === "Sedang Dikerjakan"
              ? "SEDANG_DIKERJAKAN"
              : "BELUM_DIKERJAKAN",
      });
      await refreshPrograms();
      showToast("Realisasi berhasil disimpan dan ringkasan diperbarui.");
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : "Realisasi gagal disimpan.", "error");
    }
  };

  // Mark Program as Complete (Operator)
  const handleMarkComplete = async (program: Program, hasPhoto: boolean) => {
    try {
      await programApi.complete(program.id, { foto: hasPhoto });
      await refreshPrograms();
      showToast("Kegiatan ditandai selesai dan status telah dikunci.");
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : "Kegiatan gagal diselesaikan.", "error");
    }
  };

  // Record Cost (Operator)
  const handleSaveCost = async (costData: {
    tanggal: string;
    tahap: string;
    uraian: string;
    nominal: number;
    hasProof: boolean;
  }) => {
    if (!targetProgramForCost) return;
    try {
      await programApi.addCost(targetProgramForCost.id, {
        tanggal: costData.tanggal,
        uraian: `${costData.tahap}: ${costData.uraian}`,
        nominal: costData.nominal,
        bukti: costData.hasProof,
      });
      await refreshPrograms();
      showToast("Penggunaan biaya berhasil dicatat. Sisa anggaran diperbarui.");
      setCostModalOpen(false);
      setTargetProgramForCost(null);
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : "Penggunaan biaya gagal dicatat.", "error");
    }
  };

  // Update status of advice (Operator)
  const handleUpdateAdviceStatus = async (id: string) => {
    try {
      await adviceApi.updateStatus(id, "SUDAH_DITINDAKLANJUTI");
      await refreshAdvice();
      showToast("Status arahan pimpinan berhasil diperbarui.");
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : "Status arahan gagal diperbarui.", "error");
    }
  };

  // Pending advice count for notification badge
  const pendingNotificationCount =
    currentUser?.role === "Operator"
      ? adviceRecords.filter(
          (a) =>
            (a.operatorPenerima === currentUser.nama ||
              a.operatorPenerima === "Belum ditugaskan") &&
            a.status === "Belum ditindaklanjuti"
        ).length
      : 0;

  // Public Landing Screen
  if (screen === "landing") {
    return (
      <>
        <PublicLanding
          onOpenLogin={() => setScreen("login")}
          onSelectProgram={(id) => {
            setSelectedProgramId(id);
            setScreen("login");
          }}
        />
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: null })}
        />
      </>
    );
  }

  // Login Screen
  if (screen === "login") {
    return (
      <>
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onBackToLanding={() => setScreen("landing")}
        />
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: null })}
        />
      </>
    );
  }

  // Active App Screen with Sidebar, Topbar, and Views
  const selectedProgram =
    programs.find((p) => p.id === selectedProgramId) || programs[0];

  return (
    <div className="min-h-screen flex bg-[#F4F7FA]">
      {/* Sidebar */}
      {currentUser && (
        <Sidebar
          currentUser={currentUser}
          currentPage={currentPage}
          isOpen={sidebarOpen}
          onNavigate={(page) => setCurrentPage(page)}
          onLogout={handleLogout}
          onCloseMobile={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {currentUser && (
          <Topbar
            currentUser={currentUser}
            currentPage={currentPage}
            pendingNotificationCount={pendingNotificationCount}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            onNavigate={(page) => setCurrentPage(page)}
          />
        )}

        <main className="flex-1 p-5 sm:p-8 max-w-7xl w-full mx-auto">
          {currentUser && currentPage === "dashboard" && (
            <DashboardView
              currentUser={currentUser}
              programs={programs}
              adviceRecords={adviceRecords}
              surveys={surveys}
              onNavigate={(page) => setCurrentPage(page)}
              onSelectProgram={handleViewProgram}
              onDeleteProgram={handleDeleteActivity}
              onDeleteSurvey={handleDeleteSurvey}
              onAdviceCreated={refreshAdvice}
              initialAdviceProgramId={targetAdviceProgramId}
              onClearInitialAdviceProgramId={() => setTargetAdviceProgramId(null)}
            />
          )}

          {currentUser && currentPage === "users" && currentUser.role === "Admin" && (
            <UsersView
              users={users}
              currentUser={currentUser}
              onOpenAddUser={() => {
                setEditingUser(null);
                setUserModalOpen(true);
              }}
              onOpenEditUser={(u) => {
                setEditingUser(u);
                setUserModalOpen(true);
              }}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {currentUser &&
            currentPage === "masteractivities" &&
            currentUser.role === "Admin" && (
              <MasterActivitiesView
                programs={programs}
                onOpenAddActivity={() => {
                  setEditingActivity(null);
                  setActivityModalOpen(true);
                }}
                onOpenEditActivity={(p) => {
                  setEditingActivity(p);
                  setActivityModalOpen(true);
                }}
                onViewProgram={handleViewMasterActivity}
                onDeleteActivity={handleDeleteActivity}
              />
            )}

          {currentUser && currentPage === "programs" && (
            <ProgramsView
              currentUser={currentUser}
              programs={programs}
              onViewProgram={handleViewProgram}
              onOpenScheduleModal={(p) => {
                setTargetProgramForSchedule(p);
                setScheduleModalOpen(true);
              }}
              onClaimProgram={handleClaimProgram}
              onNavigateSchedulePage={handleNavigateSchedulePage}
            />
          )}

          {currentUser && currentPage === "survey" && (
            <SurveyView
              currentUser={currentUser}
              programs={programs}
              surveys={surveys}
              onSaveSurvey={handleSaveSurvey}
              onDeleteSurvey={handleDeleteSurvey}
              onNavigateToProgram={(progId) => {
                setSelectedProgramId(progId);
                setCurrentPage("schedule");
              }}
            />
          )}

          {currentUser && currentPage === "adminsurvey" && (
            <AdminSurveyView
              currentUser={currentUser}
              surveys={surveys}
              programs={programs}
              operators={users}
              onVerifySurvey={handleVerifySurvey}
              onCreateProgramFromSurvey={handleCreateProgramFromSurvey}
              onViewProgram={handleViewProgram}
            />
          )}

          {currentUser && currentPage === "schedule" && (
            <ScheduleView
              currentUser={currentUser}
              programs={programs}
              selectedProgramId={selectedProgramId}
              onSelectProgramId={setSelectedProgramId}
              onBack={() => setCurrentPage("programs")}
              onOpenScheduleModal={(p) => {
                setTargetProgramForSchedule(p);
                setScheduleModalOpen(true);
              }}
              onOpenCostModal={(p) => {
                setTargetProgramForCost(p);
                setCostModalOpen(true);
              }}
              onSaveProgress={handleSaveProgress}
              onMarkComplete={handleMarkComplete}
              onNotify={(msg, type) => showToast(msg, type)}
            />
          )}

          {currentUser && currentPage === "history" && (
            <HistoryView
              currentUser={currentUser}
              programs={programs}
              selectedProgramId={selectedProgramId}
              onSelectProgramId={setSelectedProgramId}
            />
          )}

          {currentUser && currentPage === "reports" && (
            <ReportsView
              currentUser={currentUser}
              programs={programs}
              onNotify={(msg) => showToast(msg)}
            />
          )}

          {currentUser && currentPage === "detail" && selectedProgram && (
            <DetailView
              program={selectedProgram}
              currentUser={currentUser}
              onBack={() => setCurrentPage(previousPage)}
              onNavigateToDashboardAdvice={(programId) => {
                setTargetAdviceProgramId(programId);
                setCurrentPage("dashboard");
              }}
              onNotify={(msg, type) => showToast(msg, type)}
            />
          )}

          {currentUser &&
            currentPage === "masteractivitydetail" &&
            selectedProgram && (
              <MasterActivityDetailView
                program={selectedProgram}
                currentUser={currentUser}
                onBack={() => setCurrentPage("masteractivities")}
                onNotify={(msg, type) => showToast(msg, type)}
              />
            )}

          {currentUser && currentPage === "profile" && (
            <ProfileView
              currentUser={currentUser}
              adviceRecords={adviceRecords}
              onUpdateAdviceStatus={handleUpdateAdviceStatus}
              onNavigateToProgram={(programId) => {
                setSelectedProgramId(programId);
                setCurrentPage("schedule");
              }}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      {userModalOpen && (
        <UserModal
          user={editingUser}
          onClose={() => {
            setUserModalOpen(false);
            setEditingUser(null);
          }}
          onSave={handleSaveUser}
        />
      )}

      {activityModalOpen && (
        <ActivityModal
          activity={editingActivity}
          operators={users}
          onClose={() => {
            setActivityModalOpen(false);
            setEditingActivity(null);
          }}
          onSave={handleSaveActivity}
        />
      )}

      {scheduleModalOpen && targetProgramForSchedule && (
        <ScheduleModal
          program={targetProgramForSchedule}
          onClose={() => {
            setScheduleModalOpen(false);
            setTargetProgramForSchedule(null);
          }}
          onSave={handleSaveSchedule}
        />
      )}

      {costModalOpen && targetProgramForCost && (
        <CostModal
          program={targetProgramForCost}
          onClose={() => {
            setCostModalOpen(false);
            setTargetProgramForCost(null);
          }}
          onSave={handleSaveCost}
        />
      )}

      {/* Global Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: null })}
      />
    </div>
  );
}
