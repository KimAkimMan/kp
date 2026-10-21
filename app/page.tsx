"use client";

import React, { useState, useEffect } from "react";
import { Program, User, AdviceRecord, PageType, FieldSurvey } from "./types";
import { initialPrograms, initialUsers, initialSurveys } from "./data/initialData";
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
import { ProfileView } from "./components/views/ProfileView";

import {
  UserModal,
  ActivityModal,
  ScheduleModal,
  CostModal,
} from "./components/Modals";

const PROGRAMS_STORAGE_KEY = "simp-kuningan-programs";
const ADVICE_STORAGE_KEY = "simp-kuningan-saran-arahan";
const SURVEYS_STORAGE_KEY = "simp-kuningan-surveys";

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

  // Sync with browser storage once mounted
  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      try {
        const stored = localStorage.getItem(PROGRAMS_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const migrated = parsed.map((p: Program) => {
              let kategori = p.kategori;
              if (kategori === "Air Bersih" || kategori === "Penataan Kawasan") {
                kategori = "Konstruksi Lainnya";
              }
              const u = String(p.satuan || "").toLowerCase();
              if (u === "km" || u.includes("kilometer")) {
                const factor = (p.target || 0) <= 50 ? 1000 : 1;
                return {
                  ...p,
                  kategori,
                  satuan: "m'",
                  target: (p.target || 0) * factor,
                  targetAwal: (p.targetAwal || 0) * factor,
                  targetVolume: (p.targetVolume || 0) * factor,
                  realisasi: (p.realisasi || 0) * factor,
                  realisasiVolume: (p.realisasiVolume || 0) * factor,
                  histories: Array.isArray(p.histories)
                    ? p.histories.map((h) => ({
                        ...h,
                        satuan: "m'",
                        nilai: (h.nilai || 0) <= 50 ? (h.nilai || 0) * 1000 : h.nilai,
                      }))
                    : [],
                };
              }
              if (u.includes("meter lari") || u === "m'" || u === "m" || u === "meter") {
                return {
                  ...p,
                  kategori,
                  satuan: "m'",
                  histories: Array.isArray(p.histories)
                    ? p.histories.map((h) => ({
                        ...h,
                        satuan: "m'",
                      }))
                    : [],
                };
              }
              if (u.includes("meter persegi") || u === "m²" || u === "m2") {
                return {
                  ...p,
                  kategori,
                  satuan: "m2",
                  histories: Array.isArray(p.histories)
                    ? p.histories.map((h) => ({
                        ...h,
                        satuan: "m2",
                      }))
                    : [],
                };
              }
              return { ...p, kategori };
            });
            setPrograms(migrated);
            localStorage.setItem(PROGRAMS_STORAGE_KEY, JSON.stringify(migrated));
          }
        }
      } catch {
        // Fallback to initial
      }

      try {
        const storedAdvice = localStorage.getItem(ADVICE_STORAGE_KEY);
        if (storedAdvice) {
          const parsed = JSON.parse(storedAdvice);
          if (Array.isArray(parsed)) {
            setAdviceRecords(parsed);
          }
        }
      } catch {
        // Fallback
      }

      try {
        const storedSurveys = localStorage.getItem(SURVEYS_STORAGE_KEY);
        if (storedSurveys) {
          const parsed = JSON.parse(storedSurveys);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const migratedSurveys = parsed.map((s: FieldSurvey) => {
              let kategori = s.kategori;
              if (kategori === "Air Bersih" || kategori === "Penataan Kawasan") {
                kategori = "Konstruksi Lainnya";
              }
              return { ...s, kategori };
            });
            setSurveys(migratedSurveys);
            localStorage.setItem(SURVEYS_STORAGE_KEY, JSON.stringify(migratedSurveys));
          }
        }
      } catch {
        // Fallback
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, []);

  // Modals state
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Program | null>(null);

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [targetProgramForSchedule, setTargetProgramForSchedule] =
    useState<Program | null>(null);

  const [costModalOpen, setCostModalOpen] = useState(false);
  const [targetProgramForCost, setTargetProgramForCost] =
    useState<Program | null>(null);

  // Toast state
  const [toast, setToast] = useState<{
    message: string | null;
    type?: "success" | "error";
  }>({ message: null, type: "success" });

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  };

  // Save programs whenever changed
  const saveProgramsState = (newPrograms: Program[]) => {
    setPrograms(newPrograms);
    try {
      localStorage.setItem(PROGRAMS_STORAGE_KEY, JSON.stringify(newPrograms));
    } catch {
      showToast("Perubahan gagal disimpan ke browser.", "error");
    }
  };

  // Save advice records whenever changed
  const saveAdviceState = (newAdvice: AdviceRecord[]) => {
    setAdviceRecords(newAdvice);
    try {
      localStorage.setItem(ADVICE_STORAGE_KEY, JSON.stringify(newAdvice));
    } catch {
      showToast("Saran gagal disimpan ke browser.", "error");
    }
  };

  // Save surveys state whenever changed
  const saveSurveysState = (newSurveys: FieldSurvey[]) => {
    setSurveys(newSurveys);
    try {
      localStorage.setItem(SURVEYS_STORAGE_KEY, JSON.stringify(newSurveys));
    } catch {
      showToast("Data survey gagal disimpan ke browser.", "error");
    }
  };

  // Save / Update Survey Lapangan
  const handleSaveSurvey = (survey: FieldSurvey) => {
    const exists = surveys.some((s) => s.id === survey.id);
    let updated: FieldSurvey[];
    if (exists) {
      updated = surveys.map((s) => (s.id === survey.id ? survey : s));
      showToast(`Data survey ${survey.kodeSurvey} berhasil diperbarui.`);
    } else {
      updated = [survey, ...surveys];
      showToast(`Survey lapangan ${survey.kodeSurvey} berhasil disimpan!`);
    }
    saveSurveysState(updated);
  };

  // Delete Survey Lapangan
  const handleDeleteSurvey = (id: string) => {
    const updated = surveys.filter((s) => s.id !== id);
    saveSurveysState(updated);
    showToast("Data survey berhasil dihapus.");
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

  // Open schedule page for Operator
  const handleNavigateSchedulePage = (id: number) => {
    setSelectedProgramId(id);
    setCurrentPage("schedule");
  };

  // Claim program for Operator
  const handleClaimProgram = (id: number) => {
    if (!currentUser || currentUser.role !== "Operator") return;
    const target = programs.find((p) => p.id === id);
    if (!target) return;

    const owner = operatorAssignment(target);
    if (owner && !isAssignedToCurrentOperator(target, currentUser)) {
      showToast("Kegiatan ini telah diambil oleh Operator lain.", "error");
      return;
    }

    const updated = programs.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          operatorPengelola: currentUser.nama,
          operatorPengelolaId: currentUser.id,
          pj: currentUser.nama,
        };
      }
      return p;
    });

    saveProgramsState(updated);
    showToast("Kegiatan berhasil diambil. Anda dapat melengkapi datanya.");

    const claimed = updated.find((p) => p.id === id);
    if (claimed) {
      setTargetProgramForSchedule(claimed);
      setScheduleModalOpen(true);
    }
  };

  // Add / Edit User (Admin)
  const handleSaveUser = (userData: Partial<User>) => {
    if (editingUser) {
      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? { ...u, ...userData } : u))
      );
      showToast("Data pengguna berhasil diperbarui.");
    } else {
      const newUser: User = {
        id: Date.now(),
        nama: userData.nama || "",
        email: userData.email || "",
        role: userData.role || "Operator",
        password: "demo123",
      };
      setUsers((prev) => [...prev, newUser]);
      showToast("Pengguna baru berhasil ditambahkan.");
    }
    setUserModalOpen(false);
    setEditingUser(null);
  };

  // Add / Edit Master Activity (Admin)
  const handleSaveActivity = (data: Partial<Program>) => {
    if (editingActivity) {
      const updated = programs.map((p) =>
        p.id === editingActivity.id ? { ...p, ...data } : p
      );
      saveProgramsState(updated);
      showToast("Master kegiatan berhasil diperbarui.");
    } else {
      const newId = Date.now();
      const newProgram: Program = {
        id: newId,
        kode: `PKP-2026-${String(newId).slice(-4)}`,
        nama: data.nama || "",
        namaKegiatan: data.nama || "",
        kategori: data.kategori || "Jalan Lingkungan",
        pagu: data.pagu || 0,
        penggunaan: 0,
        penggunaanBiaya: 0,
        targetAwal: 0,
        target: 0,
        targetVolume: 0,
        realisasi: 0,
        realisasiVolume: 0,
        satuan: "Unit",
        lokasi: data.lokasi || "Kabupaten Kuningan",
        kecamatan: data.kecamatan || "",
        desaKelurahan: data.desaKelurahan || "",
        detailLokasi: data.detailLokasi || "",
        pj: data.pj || "Belum Ditugaskan",
        operatorPengelola: data.operatorPengelola || null,
        operatorPengelolaId: data.operatorPengelolaId || null,
        penanggungJawabDinas: null,
        periode: "Januari–Desember 2026",
        jadwal: "Januari–Desember 2026",
        status: "Belum Dikerjakan",
        update: "Belum ada pembaruan",
        sumber: "Belum ada sumber pembaruan",
        catatan: "Master kegiatan baru dari Admin.",
        histories: [],
        costs: [],
      };
      saveProgramsState([newProgram, ...programs]);
      showToast("Master kegiatan baru berhasil disimpan.");
    }
    setActivityModalOpen(false);
    setEditingActivity(null);
  };

  // Convert Survey to Master Activity (Admin)
  const handleCreateProgramFromSurvey = (
    survey: FieldSurvey,
    customData?: Partial<Program>
  ) => {
    const newId = Date.now();
    const newKode = `PKP-2026-${String(newId).slice(-4)}`;
    const fullLokasi =
      customData?.lokasi ||
      (survey.detailLokasi
        ? `${survey.detailLokasi}, Desa ${survey.desaKelurahan}, Kec. ${survey.kecamatan}`
        : `Desa ${survey.desaKelurahan}, Kec. ${survey.kecamatan}`);

    const newProgram: Program = {
      id: newId,
      kode: newKode,
      nama: customData?.nama || survey.namaKegiatan,
      namaKegiatan:
        customData?.namaKegiatan || customData?.nama || survey.namaKegiatan,
      kategori:
        customData?.kategori ||
        (survey.kategori === "Air Bersih" || survey.kategori === "Penataan Kawasan"
          ? "Konstruksi Lainnya"
          : survey.kategori || "Jalan Lingkungan"),
      pagu:
        customData?.pagu !== undefined
          ? customData.pagu
          : survey.estimasiBiaya || 0,
      penggunaan: 0,
      penggunaanBiaya: 0,
      targetAwal:
        customData?.target !== undefined
          ? customData.target
          : survey.luasVolume || survey.panjang || 1,
      target:
        customData?.target !== undefined
          ? customData.target
          : survey.luasVolume || survey.panjang || 1,
      targetVolume:
        customData?.targetVolume !== undefined
          ? customData.targetVolume
          : survey.luasVolume || survey.panjang || 1,
      realisasi: 0,
      realisasiVolume: 0,
      satuan:
        customData?.satuan ||
        survey.satuan ||
        (survey.kategori === "Drainase/TPT" || survey.kategori === "Jalan Lingkungan"
          ? "m'"
          : "m2"),
      lokasi: fullLokasi,
      kecamatan: customData?.kecamatan || survey.kecamatan,
      desaKelurahan: customData?.desaKelurahan || survey.desaKelurahan,
      detailLokasi: customData?.detailLokasi || survey.detailLokasi,
      pj: survey.surveyor || "Belum Ditugaskan",
      operatorPengelola: survey.surveyor || null,
      operatorPengelolaId: survey.surveyorId || null,
      penanggungJawabDinas: null,
      periode: "Januari–Desember 2026",
      jadwal: "Januari–Desember 2026",
      status: "Belum Dikerjakan",
      update: new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      sumber: `Hasil Survey Lapangan (${survey.kodeSurvey})`,
      catatan: `Dibuat dari hasil survey lapangan (${survey.kodeSurvey}) oleh ${survey.surveyor}. Temuan: ${survey.uraianTemuan}. Rekomendasi: ${survey.rekomendasi}`,
      lebarJalan: survey.lebar,
      kondisiJalan: survey.kondisi,
      histories: [],
      costs: [],
    };

    const updatedPrograms = [newProgram, ...programs];
    saveProgramsState(updatedPrograms);

    const updatedSurveys = surveys.map((s) =>
      s.id === survey.id
        ? {
            ...s,
            programId: newId,
            status: "Diverifikasi" as const,
          }
        : s
    );
    saveSurveysState(updatedSurveys);

    showToast(
      `Kegiatan baru "${newProgram.nama}" berhasil dibuat di Master Kegiatan!`
    );
    setCurrentPage("masteractivities");
  };

  // Save Schedule / Technical Setup (Operator)
  const handleSaveSchedule = (data: Partial<Program>) => {
    if (!targetProgramForSchedule) return;

    const updated = programs.map((p) => {
      if (p.id === targetProgramForSchedule.id) {
        return {
          ...p,
          ...data,
          operatorPengelola: p.operatorPengelola || currentUser?.nama || null,
          operatorPengelolaId: p.operatorPengelolaId || currentUser?.id || null,
          pj:
            p.pj && p.pj !== "Belum Ditugaskan"
              ? p.pj
              : currentUser?.nama || "Operator",
          status:
            p.status === "Belum Dikerjakan" &&
            ((data.target || 0) > 0 || (data.targetVolume || 0) > 0)
              ? ("Sedang Dikerjakan" as const)
              : p.status,
        };
      }
      return p;
    });
    saveProgramsState(updated);
    showToast("Data kegiatan dan target berhasil disimpan.");
    setScheduleModalOpen(false);
    setTargetProgramForSchedule(null);
  };

  // Save Progress & Realization (Operator)
  const handleSaveProgress = (progressData: {
    tanggal: string;
    status: "Belum Dikerjakan" | "Sedang Dikerjakan" | "Selesai Dikerjakan";
    tahap: string;
    realisasi: number;
    catatan: string;
    hasPhoto: boolean;
  }) => {
    const formattedDate = new Date(progressData.tanggal).toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );

    const updated = programs.map((p) => {
      if (p.id === selectedProgramId) {
        const newHistory = {
          tanggal: formattedDate,
          tahap: progressData.tahap,
          nilai: progressData.realisasi,
          satuan: p.satuan,
          keterangan: progressData.catatan,
          foto: progressData.hasPhoto,
          penginput: currentUser?.nama || "Operator",
          status: progressData.status,
        };

        return {
          ...p,
          realisasi: progressData.realisasi,
          realisasiVolume: progressData.realisasi,
          status: progressData.status,
          update: formattedDate,
          catatan: progressData.catatan,
          sumber: "Input progres Operator",
          histories: [newHistory, ...(p.histories || [])],
        };
      }
      return p;
    });

    saveProgramsState(updated);
    showToast("Realisasi berhasil disimpan dan ringkasan diperbarui.");
  };

  // Mark Program as Complete (Operator)
  const handleMarkComplete = (program: Program, hasPhoto: boolean) => {
    const completedDate = new Date().toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const updated = programs.map((p) => {
      if (p.id === program.id) {
        const completionHistory = {
          tanggal: completedDate,
          tahap: "Penyelesaian kegiatan",
          nilai: p.realisasi,
          satuan: p.satuan,
          keterangan: "Kegiatan ditandai selesai setelah realisasi fisik mencapai 100%.",
          foto: hasPhoto,
          penginput: currentUser?.nama || "Operator",
          status: "Selesai Dikerjakan" as const,
        };

        return {
          ...p,
          status: "Selesai Dikerjakan" as const,
          update: completedDate,
          histories: [completionHistory, ...(p.histories || [])],
        };
      }
      return p;
    });

    saveProgramsState(updated);
    showToast("Kegiatan ditandai selesai dan status telah dikunci.");
  };

  // Record Cost (Operator)
  const handleSaveCost = (costData: {
    tanggal: string;
    tahap: string;
    uraian: string;
    nominal: number;
    hasProof: boolean;
  }) => {
    if (!targetProgramForCost) return;

    const formattedDate = new Date(costData.tanggal).toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );

    const updated = programs.map((p) => {
      if (p.id === targetProgramForCost.id) {
        const newCostItem = {
          tanggal: formattedDate,
          uraian: `${costData.tahap}: ${costData.uraian}`,
          nominal: costData.nominal,
          input: currentUser?.nama || "Operator",
          bukti: costData.hasProof,
        };

        const newPenggunaan = (p.penggunaan || 0) + costData.nominal;

        return {
          ...p,
          penggunaan: newPenggunaan,
          penggunaanBiaya: newPenggunaan,
          costs: [newCostItem, ...(p.costs || [])],
        };
      }
      return p;
    });

    saveProgramsState(updated);
    showToast("Penggunaan biaya berhasil dicatat. Sisa anggaran diperbarui.");
    setCostModalOpen(false);
    setTargetProgramForCost(null);
  };

  // Add Advice (Pimpinan)
  const handleAddAdvice = (
    record: Omit<AdviceRecord, "id" | "tanggal" | "status">
  ) => {
    const newAdvice: AdviceRecord = {
      id: `SARAN-${Date.now()}`,
      tanggal: new Date().toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      status: "Belum ditindaklanjuti",
      ...record,
    };

    saveAdviceState([newAdvice, ...adviceRecords]);
    showToast("Saran dan arahan berhasil disampaikan ke Operator.");
  };

  // Update status of advice (Operator)
  const handleUpdateAdviceStatus = (id: string, newStatus: string) => {
    const updated = adviceRecords.map((a) =>
      a.id === id ? { ...a, status: newStatus } : a
    );
    saveAdviceState(updated);
    showToast("Status arahan pimpinan berhasil diperbarui.");
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
          programs={programs}
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
          users={users}
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
              onAddAdvice={handleAddAdvice}
              onNavigate={(page) => setCurrentPage(page)}
              onSelectProgram={handleViewProgram}
              initialAdviceProgramId={targetAdviceProgramId}
              onClearInitialAdviceProgramId={() => setTargetAdviceProgramId(null)}
            />
          )}

          {currentUser && currentPage === "users" && currentUser.role === "Admin" && (
            <UsersView
              users={users}
              onOpenAddUser={() => {
                setEditingUser(null);
                setUserModalOpen(true);
              }}
              onOpenEditUser={(u) => {
                setEditingUser(u);
                setUserModalOpen(true);
              }}
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
                onViewProgram={handleViewProgram}
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
