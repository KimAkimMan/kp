"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { Program, User, AdviceRecord, PageType, FieldSurvey } from "../types";
import { SurveyStatus } from "@/generated/prisma/enums";
import { ApiClientError, adviceApi, authApi, programApi, surveyApi, userApi, apiClient } from "@/lib/api";
import type { ApiResponse } from "@/lib/api/client";
import {
  mapApiAdviceToAdvice,
  mapApiProgramToProgram,
  mapApiSurveyToSurvey,
  mapApiUserToUser,
} from "../utils/api-mappers";
import { operatorAssignment, isAssignedToCurrentOperator } from "../utils/helpers";

export interface UseAppStateReturn {
  // Screen & nav
  screen: "landing" | "login" | "app";
  setScreen: (s: "landing" | "login" | "app") => void;
  currentPage: PageType;
  setCurrentPage: (p: PageType) => void;
  previousPage: PageType;
  setPreviousPage: (p: PageType) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  selectedProgramId: number;
  setSelectedProgramId: (id: number) => void;
  targetAdviceProgramId: number | null;
  setTargetAdviceProgramId: (id: number | null) => void;

  // Auth & data
  currentUser: User | null;
  setCurrentUser: (u: User | null) => void;
  users: User[];
  setUsers: (u: User[]) => void;
  programs: Program[];
  setPrograms: (p: Program[]) => void;
  adviceRecords: AdviceRecord[];
  setAdviceRecords: (a: AdviceRecord[]) => void;
  surveys: FieldSurvey[];
  setSurveys: (s: FieldSurvey[]) => void;

  // Modals
  userModalOpen: boolean;
  setUserModalOpen: (v: boolean) => void;
  editingUser: User | null;
  setEditingUser: (u: User | null) => void;
  activityModalOpen: boolean;
  setActivityModalOpen: (v: boolean) => void;
  editingActivity: Program | null;
  setEditingActivity: (p: Program | null) => void;
  scheduleModalOpen: boolean;
  setScheduleModalOpen: (v: boolean) => void;
  targetProgramForSchedule: Program | null;
  setTargetProgramForSchedule: (p: Program | null) => void;
  costModalOpen: boolean;
  setCostModalOpen: (v: boolean) => void;
  targetProgramForCost: Program | null;
  setTargetProgramForCost: (p: Program | null) => void;

  // Actions
  showToast: (message: string, type?: "success" | "error") => void;
  handleLoginSuccess: (user: User) => void;
  handleLogout: () => void;
  handleViewProgram: (id: number) => void;
  handleViewMasterActivity: (id: number) => void;
  handleNavigateSchedulePage: (id: number) => void;
  handleClaimProgram: (id: number) => Promise<void>;
  handleAcceptAssignment: (programId: number, assignmentId: number) => Promise<void>;
  handleReleaseAssignment: (programId: number, assignmentId: number) => Promise<void>;
  handleDeleteAssignment: (programId: number, assignmentId: number) => Promise<void>;
  handleSaveUser: (userData: Partial<User>) => Promise<void>;
  handleDeleteUser: (user: User) => Promise<void>;
  handleDeleteActivity: (program: Program) => Promise<void>;
  handleSaveActivity: (data: Partial<Program>) => Promise<void>;
  handleSaveSurvey: (survey: FieldSurvey, photoFile?: File) => Promise<void>;
  handleDeleteSurvey: (id: string) => Promise<void>;
  handleVerifySurvey: (survey: FieldSurvey, reason?: string) => Promise<void>;
  handleRejectSurvey: (survey: FieldSurvey, reason?: string) => Promise<void>;
  handleRequestRevision: (survey: FieldSurvey, reason?: string) => Promise<void>;
  handleCreateProgramFromSurvey: (survey: FieldSurvey, customData?: Partial<Program>) => Promise<void>;
  handleSaveSchedule: (data: Partial<Program>) => Promise<void>;
  handleSaveProgress: (progressData: {
    tanggal: string;
    status: "Belum Dikerjakan" | "Sedang Dikerjakan";
    tahap: string;
    realisasi: number;
    catatan: string;
    hasPhoto: boolean;
    fotoUrls?: string[];
    photoFiles?: File[];
  }) => Promise<void>;
  handleMarkComplete: (program: Program, hasPhoto: boolean) => Promise<void>;
  handleVerifyProgress: (progressId: number, decision: "APPROVED" | "REJECTED", rejectionReason?: string) => Promise<void>;
  handleVerifyCost: (costId: number, decision: "APPROVED" | "REJECTED", rejectionReason?: string) => Promise<void>;
  handleSaveCost: (costData: { tanggal: string; tahap: string; uraian: string; nominal: number; hasProof: boolean }) => Promise<void>;
  handleUpdateAdviceStatus: (id: string) => Promise<void>;
  refreshAdvice: () => Promise<void>;
  pendingNotificationCount: number;
  toast: { message: string | null; type?: "success" | "error" };
  setToast: (v: { message: string | null; type?: "success" | "error" }) => void;
}

export function useAppState(): UseAppStateReturn {
  // Screen & nav
  const [screen, setScreen] = useState<"landing" | "login" | "app">("landing");
  const [currentPage, setCurrentPage] = useState<PageType>("dashboard");
  const [previousPage, setPreviousPage] = useState<PageType>("programs");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<number>(1);
  const [targetAdviceProgramId, setTargetAdviceProgramId] = useState<number | null>(null);

  // Auth & data
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [adviceRecords, setAdviceRecords] = useState<AdviceRecord[]>([]);
  const [surveys, setSurveys] = useState<FieldSurvey[]>([]);
  const [toast, setToast] = useState<{ message: string | null; type?: "success" | "error" }>({ message: null, type: "success" });

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
  }, []);

  const fetchAllPages = useCallback(async <T,>(
    loader: (page: number, pageSize: number) => Promise<{ data: T[]; meta: { page: number; totalPages: number } }>,
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
    const response = await fetchAllPages((page, pageSize) => programApi.list({ page, pageSize }));
    setPrograms(response.map(mapApiProgramToProgram));
  }, [fetchAllPages]);

  const refreshUsers = useCallback(async () => {
    const response = await fetchAllPages((page, pageSize) => userApi.list({ page, pageSize }));
    setUsers(response.map(mapApiUserToUser));
  }, [fetchAllPages]);

  const refreshSurveys = useCallback(async () => {
    const response = await fetchAllPages((page, pageSize) => surveyApi.list({ page, pageSize }));
    setSurveys(response.map(mapApiSurveyToSurvey));
  }, [fetchAllPages]);

  const refreshAdvice = useCallback(async () => {
    const response = await fetchAllPages((page, pageSize) => adviceApi.list({ page, pageSize }));
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
            const userItems = await fetchAllPages((page, pageSize) => userApi.list({ page, pageSize }));
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
    return () => { cancelled = true; };
  }, [currentUser, fetchAllPages, showToast]);

  useEffect(() => {
    let cancelled = false;
    const restoreSession = async () => {
      try {
        const { data } = await authApi.me();
        if (cancelled) return;
        setCurrentUser((previous) => previous ?? mapApiUserToUser(data));
        setScreen((previous) => (previous === "landing" ? "app" : previous));
      } catch {
        // 401/UNAUTHENTICATED: tetap di landing.
      }
    };
    void restoreSession();
    return () => { cancelled = true; };
  }, []);

  // Modals state
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Program | null>(null);
  const activitySubmitInFlight = useRef(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [targetProgramForSchedule, setTargetProgramForSchedule] = useState<Program | null>(null);
  const [costModalOpen, setCostModalOpen] = useState(false);
  const [targetProgramForCost, setTargetProgramForCost] = useState<Program | null>(null);

  // Handlers
  const handleSaveSurvey = async (survey: FieldSurvey, photoFile?: File) => {
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
    const exists = surveys.some((s) => s.id === survey.id);
    const input = {
      kodeSurvey: survey.kodeSurvey,
      tanggal,
      surveyor: survey.surveyor,
      ...(!exists && { surveyorId: survey.surveyorId ? Number(survey.surveyorId) : undefined }),
      ...(!exists && { programId: survey.programId ?? null }),
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
      status: statusStringToSurveyStatus[survey.status] ?? SurveyStatus.MENUNGGU_VERIFIKASI,
    };
    try {
      let createdSurvey: { id: string } | null = null;
      if (exists) {
        await surveyApi.update(survey.id, input);
        showToast(`Data survey ${survey.kodeSurvey} berhasil diperbarui.`);
        createdSurvey = { id: survey.id };
      } else {
        const response = await surveyApi.create(input);
        createdSurvey = response.data;
        showToast(`Survey lapangan ${survey.kodeSurvey} berhasil disimpan!`);
      }
      if (createdSurvey && photoFile) {
        try {
          await surveyApi.uploadPhoto(createdSurvey.id, photoFile);
          showToast("Foto survey berhasil diupload ke object storage.");
        } catch (uploadError) {
          const msg = uploadError instanceof Error ? uploadError.message : "Gagal mengupload foto.";
          showToast(`Survey tersimpan, tetapi ${msg}`, "error");
        }
      }
      await refreshSurveys();
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : "Survey gagal disimpan.", "error");
    }
  };

  const handleDeleteSurvey = async (id: string) => {
    try {
      await surveyApi.remove(id);
      await refreshSurveys();
      showToast("Data survey berhasil dihapus.");
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : "Survey gagal dihapus.", "error");
    }
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setScreen("app");
    setCurrentPage("dashboard");
    showToast(`Selamat datang kembali, ${user.nama}!`);
  };

  const handleLogout = () => {
    void authApi.logout().catch(() => undefined);
    setCurrentUser(null);
    setScreen("landing");
    showToast("Anda telah keluar dari aplikasi.");
  };

  const handleViewProgram = (id: number) => {
    setSelectedProgramId(id);
    setPreviousPage(currentPage === "detail" ? "programs" : currentPage);
    setCurrentPage("detail");
  };

  const handleViewMasterActivity = (id: number) => {
    setSelectedProgramId(id);
    setCurrentPage("masteractivitydetail");
  };

  const handleNavigateSchedulePage = (id: number) => {
    setSelectedProgramId(id);
    setCurrentPage("schedule");
  };

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
      showToast(error instanceof ApiClientError ? error.message : "Kegiatan gagal diambil.", "error");
    }
  };

  const handleAcceptAssignment = async (programId: number, assignmentId: number) => {
    if (!currentUser || currentUser.role !== "Operator") return;
    try {
      await programApi.acceptAssignment(programId, assignmentId);
      await refreshPrograms();
      showToast("Penugasan diterima. Anda dapat mengedit kegiatan ini.");
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : "Gagal menerima penugasan.", "error");
    }
  };

  const handleReleaseAssignment = async (programId: number, assignmentId: number) => {
    if (!currentUser) return;
    try {
      await programApi.releaseAssignment(programId, assignmentId);
      await refreshPrograms();
      showToast("Penugasan dilepas. Kegiatan tersedia untuk Operator lain.");
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : "Gagal melepas penugasan.", "error");
    }
  };

  const handleDeleteAssignment = async (programId: number, assignmentId: number) => {
    if (!currentUser || currentUser.role !== "Admin") return;
    if (!window.confirm("Yakin ingin menghapus penugasan ini?")) return;
    try {
      await programApi.removeAssignment(programId, assignmentId);
      await refreshPrograms();
      showToast("Penugasan berhasil dihapus.");
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : "Gagal menghapus penugasan.", "error");
    }
  };

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

  const handleDeleteUser = async (user: User) => {
    try {
      await userApi.remove(user.id);
      await refreshUsers();
      showToast(`Pengguna ${user.nama} berhasil dihapus.`);
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : "Pengguna gagal dihapus.", "error");
    }
  };

  const handleDeleteActivity = async (program: Program) => {
    try {
      await programApi.remove(program.id);
      await refreshPrograms();
      showToast(`Kegiatan "${program.nama}" berhasil dihapus dari Master Kegiatan.`);
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : "Kegiatan gagal dihapus.", "error");
    }
  };

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
        await programApi.create({
          kode,
          nama: data.nama || "",
          namaKegiatan: data.nama || "",
          kategori: data.kategori || "Jalan Lingkungan",
          lokasi: data.lokasi || "Kabupaten Kuningan",
          kecamatan: data.kecamatan ?? null,
          desaKelurahan: data.desaKelurahan ?? null,
          detailLokasi: data.detailLokasi ?? null,
          operatorPengelola: data.operatorPengelola ?? null,
          operatorPengelolaId: data.operatorPengelolaId ? Number(data.operatorPengelolaId) : null,
          periode: "Januari–Desember 2026",
          satuan: "Unit",
          target: data.target ?? 0,
          ...(data.pagu !== undefined && data.pagu !== null ? { pagu: data.pagu } : {}),
        }, { idempotencyKey });
        await refreshPrograms();
        showToast(data.operatorPengelolaId
          ? "Master kegiatan baru berhasil ditugaskan."
          : "Master kegiatan baru berhasil tersedia untuk Operator.");
      }
      setActivityModalOpen(false);
      setEditingActivity(null);
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : "Master kegiatan gagal disimpan.", "error");
    } finally {
      activitySubmitInFlight.current = false;
    }
  };

  const handleVerifySurvey = async (survey: FieldSurvey, reason?: string) => {
    try {
      await surveyApi.verify(survey.id, survey.programId ?? null);
      await refreshSurveys();
      showToast(`Survey ${survey.kodeSurvey} berhasil diverifikasi.`);
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : "Verifikasi survey gagal.", "error");
    }
  };

  const handleRejectSurvey = async (survey: FieldSurvey, reason?: string) => {
    if (!reason || !reason.trim()) {
      showToast("Alasan penolakan wajib diisi.", "error");
      return;
    }
    try {
      await surveyApi.review(survey.id, "DITOLAK", reason.trim());
      await refreshSurveys();
      showToast(`Survey ${survey.kodeSurvey} telah ditolak.`);
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : "Penolakan survey gagal.", "error");
    }
  };

  const handleRequestRevision = async (survey: FieldSurvey, reason?: string) => {
    if (!reason || !reason.trim()) {
      showToast("Alasan revisi wajib diisi.", "error");
      return;
    }
    try {
      await surveyApi.review(survey.id, "PERLU_REVISI", reason.trim());
      await refreshSurveys();
      showToast(`Survey ${survey.kodeSurvey} diminta revisi.`);
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : "Permintaan revisi gagal.", "error");
    }
  };

  const handleCreateProgramFromSurvey = async (survey: FieldSurvey, customData?: Partial<Program>) => {
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
        operatorPengelolaId: customData?.operatorPengelolaId ? Number(customData.operatorPengelolaId) : null,
      });
      await Promise.all([refreshPrograms(), refreshSurveys()]);
      showToast(`Kegiatan baru dari survey "${survey.namaKegiatan}" berhasil dibuat di Master Kegiatan!`);
      setCurrentPage("masteractivities");
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : "Konversi survey gagal.", "error");
    }
  };

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

  const handleSaveProgress = async (progressData: {
    tanggal: string;
    status: "Belum Dikerjakan" | "Sedang Dikerjakan";
    tahap: string;
    realisasi: number;
    catatan: string;
    hasPhoto: boolean;
    fotoUrls?: string[];
    photoFiles?: File[];
  }) => {
    try {
      const program = programs.find((p) => p.id === selectedProgramId);
      if (!program) {
        showToast("Program tidak ditemukan.", "error");
        return;
      }
      const allStorageKeys: string[] = [];
      const allOriginalNames: string[] = [];
      if (progressData.photoFiles && progressData.photoFiles.length > 0) {
        for (const photoFile of progressData.photoFiles) {
          const presigned = await apiClient.post<ApiResponse<{
            uploadUrl: string;
            storageKey: string;
            expiresAt: string;
            expiresInSeconds: number;
            contentType: string;
          }>>(
            `/programs/${selectedProgramId}/progress`,
            { action: "presign", originalName: photoFile.name, mimeType: photoFile.type, fileSize: photoFile.size },
          );
          const { uploadUrl, storageKey } = presigned.data;
          allStorageKeys.push(storageKey);
          allOriginalNames.push(photoFile.name);
          try {
            const putResponse = await fetch(uploadUrl, {
              method: "PUT",
              body: photoFile,
              headers: { "Content-Type": photoFile.type },
            });
            if (!putResponse.ok) {
              const text = await putResponse.text().catch(() => "");
              throw new Error(`Object storage PUT gagal (${putResponse.status}): ${text}`);
            }
          } catch (err) {
            showToast(`Gagal mengupload foto progres: ${err instanceof Error ? err.message : String(err)}`, "error");
            return;
          }
          await apiClient.post<ApiResponse<unknown>>(
            `/programs/${selectedProgramId}/progress`,
            { action: "complete", storageKey, originalName: photoFile.name, mimeType: photoFile.type, fileSize: photoFile.size },
          );
        }
        showToast(`${progressData.photoFiles.length} foto progres berhasil diupload ke object storage.`);
      }
      await programApi.addProgress(selectedProgramId, {
        tanggal: progressData.tanggal,
        tahap: progressData.tahap,
        nilai: progressData.realisasi,
        satuan: program.satuan || "Unit",
        keterangan: progressData.catatan,
        foto: progressData.hasPhoto,
        storageKey: allStorageKeys.length > 0 ? allStorageKeys.join(",") : null,
        originalName: allOriginalNames.length > 0 ? allOriginalNames.join(",") : null,
        status: progressData.status === "Sedang Dikerjakan" ? "SEDANG_DIKERJAKAN" : "BELUM_DIKERJAKAN",
      });
      await refreshPrograms();
      showToast("Realisasi berhasil disimpan dan ringkasan diperbarui.");
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : "Realisasi gagal disimpan.", "error");
    }
  };

  const handleMarkComplete = async (program: Program, hasPhoto: boolean) => {
    try {
      await programApi.complete(program.id, { foto: hasPhoto });
      await refreshPrograms();
      showToast("Kegiatan ditandai selesai dan status telah dikunci.");
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : "Kegiatan gagal diselesaikan.", "error");
    }
  };

  const handleVerifyProgress = useCallback(async (progressId: number, decision: "APPROVED" | "REJECTED", rejectionReason?: string) => {
    await programApi.verifyProgress(progressId, { decision, rejectionReason });
    await refreshPrograms();
  }, [refreshPrograms]);

  const handleVerifyCost = useCallback(async (costId: number, decision: "APPROVED" | "REJECTED", rejectionReason?: string) => {
    await programApi.verifyCost(costId, { decision, rejectionReason });
    await refreshPrograms();
  }, [refreshPrograms]);

  const handleSaveCost = async (costData: { tanggal: string; tahap: string; uraian: string; nominal: number; hasProof: boolean }) => {
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

  const handleUpdateAdviceStatus = async (id: string) => {
    try {
      await adviceApi.updateStatus(id, "SUDAH_DITINDAKLANJUTI");
      await refreshAdvice();
      showToast("Status arahan pimpinan berhasil diperbarui.");
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : "Status arahan gagal diperbarui.", "error");
    }
  };

  const pendingNotificationCount =
    currentUser?.role === "Operator"
      ? adviceRecords.filter((a) =>
          (a.operatorPenerima === currentUser.nama || a.operatorPenerima === "Belum ditugaskan") &&
          a.status === "Belum ditindaklanjuti"
        ).length
      : 0;

  return {
    screen, setScreen,
    currentPage, setCurrentPage,
    previousPage, setPreviousPage,
    sidebarOpen, setSidebarOpen,
    selectedProgramId, setSelectedProgramId,
    targetAdviceProgramId, setTargetAdviceProgramId,
    currentUser, setCurrentUser,
    users, setUsers,
    programs, setPrograms,
    adviceRecords, setAdviceRecords,
    surveys, setSurveys,
    userModalOpen, setUserModalOpen,
    editingUser, setEditingUser,
    activityModalOpen, setActivityModalOpen,
    editingActivity, setEditingActivity,
    scheduleModalOpen, setScheduleModalOpen,
    targetProgramForSchedule, setTargetProgramForSchedule,
    costModalOpen, setCostModalOpen,
    targetProgramForCost, setTargetProgramForCost,
    showToast,
    handleLoginSuccess,
    handleLogout,
    handleViewProgram,
    handleViewMasterActivity,
    handleNavigateSchedulePage,
    handleClaimProgram,
    handleAcceptAssignment,
    handleReleaseAssignment,
    handleDeleteAssignment,
    handleSaveUser,
    handleDeleteUser,
    handleDeleteActivity,
    handleSaveActivity,
    handleSaveSurvey,
    handleDeleteSurvey,
    handleVerifySurvey,
    handleRejectSurvey,
    handleRequestRevision,
    handleCreateProgramFromSurvey,
    handleSaveSchedule,
    handleSaveProgress,
    handleMarkComplete,
    handleVerifyProgress,
    handleVerifyCost,
    handleSaveCost,
    handleUpdateAdviceStatus,
    refreshAdvice,
    pendingNotificationCount,
    toast, setToast,
  };
}
