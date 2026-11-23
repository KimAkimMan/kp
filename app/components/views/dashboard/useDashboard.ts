"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Program, User, AdviceRecord, FieldSurvey, PageType } from "../../../types";
import {
  calculateSummary,
  statusCount,
  currency,
  operatorAssignment,
  getProgramDesa,
  getProgramKecamatan,
  getProgramYear,
} from "../../../utils/helpers";
import { standardCategories } from "../../../data/initialData";
import {
  programApi,
  surveyApi,
  adviceApi,
  ApiClientError,
} from "@/lib/api";
import { mapApiProgramToProgram, mapApiSurveyToSurvey, mapApiAdviceToAdvice } from "../../../utils/api-mappers";

export interface UseDashboardReturn {
  // Live state
  livePrograms: Program[];
  liveSurveys: FieldSurvey[];
  liveAdviceRecords: AdviceRecord[];
  setLivePrograms: React.Dispatch<React.SetStateAction<Program[]>>;
  setLiveSurveys: React.Dispatch<React.SetStateAction<FieldSurvey[]>>;
  setLiveAdviceRecords: React.Dispatch<React.SetStateAction<AdviceRecord[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isSubmittingAdvice: boolean;
  isDeleting: boolean;
  feedbackNotice: string | null;
  feedbackError: string | null;
  setFeedbackNotice: React.Dispatch<React.SetStateAction<string | null>>;
  setFeedbackError: React.Dispatch<React.SetStateAction<string | null>>;

  // Derived data
  isOperator: boolean;
  isPimpnin: boolean;
  isAdmin: boolean;
  displayPrograms: Program[];
  summary: ReturnType<typeof calculateSummary>;
  activeCount: number;
  doneCount: number;
  availableYears: string[];
  availableCategories: string[];
  filteredDashboardPrograms: Program[];
  operatorAdvice: AdviceRecord[];
  pendingAdvice: AdviceRecord[];
  selectedAdviceProgram: Program | undefined;
  recipientOperator: string;

  // UI states
  dashboardYearFilter: string;
  setDashboardYearFilter: React.Dispatch<React.SetStateAction<string>>;
  dashboardCategoryFilter: string;
  setDashboardCategoryFilter: React.Dispatch<React.SetStateAction<string>>;
  confirmDeleteProgram: Program | null;
  setConfirmDeleteProgram: React.Dispatch<React.SetStateAction<Program | null>>;
  confirmDeleteSurveyId: string | null;
  setConfirmDeleteSurveyId: React.Dispatch<React.SetStateAction<string | null>>;
  adminSearchTerm: string;
  setAdminSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  selectedAdviceProgramId: number | "";
  setSelectedAdviceProgramId: React.Dispatch<React.SetStateAction<number | "">>;
  adviceText: string;
  setAdviceText: React.Dispatch<React.SetStateAction<string>>;
  adviceError: string;
  setAdviceError: React.Dispatch<React.SetStateAction<string>>;
  adviceSectionRef: React.RefObject<HTMLElement | null>;

  // Actions
  refreshDashboardData: () => Promise<void>;
  handleAdviceSubmit: (e: React.FormEvent) => Promise<void>;
  handleConfirmDeleteProgram: () => Promise<void>;
  handleConfirmDeleteSurvey: () => Promise<void>;
}

export function useDashboard({
  currentUser,
  programs,
  adviceRecords,
  surveys = [],
  onNavigate,
  onAdviceCreated,
  initialAdviceProgramId,
  onClearInitialAdviceProgramId,
}: {
  currentUser: User;
  programs: Program[];
  adviceRecords: AdviceRecord[];
  surveys?: FieldSurvey[];
  onNavigate: (page: PageType) => void;
  onAdviceCreated?: () => void | Promise<void>;
  initialAdviceProgramId?: number | null;
  onClearInitialAdviceProgramId?: () => void;
}): UseDashboardReturn {
  const isOperator = currentUser.role === "Operator";
  const isPimpnin = currentUser.role === "Pimpinan";
  const isAdmin = currentUser.role === "Admin";

  // Live state from API with props as initial fallback
  const [livePrograms, setLivePrograms] = useState<Program[]>(programs);
  const [liveSurveys, setLiveSurveys] = useState<FieldSurvey[]>(surveys);
  const [liveAdviceRecords, setLiveAdviceRecords] = useState<AdviceRecord[]>(adviceRecords);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingAdvice, setIsSubmittingAdvice] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Fetch fresh data from backend APIs on mount
  async function fetchAllApiPages<T>(loader: (page: number, pageSize: number) => Promise<{
    data: T[];
    meta: { page: number; totalPages: number };
  }>): Promise<T[]> {
    const items: T[] = [];
    let page = 1;
    let totalPages = 1;
    do {
      const response = await loader(page, 100);
      items.push(...response.data);
      totalPages = response.meta.totalPages;
      page += 1;
    } while (page <= totalPages);
    return items;
  }

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      try {
        const [progsRes, surveysRes, adviceRes] = await Promise.allSettled([
          fetchAllApiPages((page, pageSize) => programApi.list({ page, pageSize })),
          fetchAllApiPages((page, pageSize) => surveyApi.list({ page, pageSize })),
          fetchAllApiPages((page, pageSize) => adviceApi.list({ page, pageSize })),
        ]);

        if (cancelled) return;

        if (progsRes.status === "fulfilled") {
          setLivePrograms(progsRes.value.map(mapApiProgramToProgram));
        }
        if (surveysRes.status === "fulfilled") {
          setLiveSurveys(surveysRes.value.map(mapApiSurveyToSurvey));
        }
        if (adviceRes.status === "fulfilled") {
          setLiveAdviceRecords(adviceRes.value.map(mapApiAdviceToAdvice));
        }
      } catch (err) {
        console.error("Dashboard API refresh error:", err);
      }
    }

    void loadInitialData();
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshDashboardData = useCallback(async () => {
    setIsLoading(true);
    setFeedbackError(null);
    try {
      const [progsRes, surveysRes, adviceRes] = await Promise.allSettled([
        fetchAllApiPages((page, pageSize) => programApi.list({ page, pageSize })),
        fetchAllApiPages((page, pageSize) => surveyApi.list({ page, pageSize })),
        fetchAllApiPages((page, pageSize) => adviceApi.list({ page, pageSize })),
      ]);

      if (progsRes.status === "fulfilled") {
        setLivePrograms(progsRes.value.map(mapApiProgramToProgram));
      }
      if (surveysRes.status === "fulfilled") {
        setLiveSurveys(surveysRes.value.map(mapApiSurveyToSurvey));
      }
      if (adviceRes.status === "fulfilled") {
        setLiveAdviceRecords(adviceRes.value.map(mapApiAdviceToAdvice));
      }
    } catch (err) {
      console.error("Dashboard API refresh error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filter accessible programs for Operator
  const displayPrograms = isOperator
    ? livePrograms.filter((p) => {
        const owner = operatorAssignment(p);
        return !owner || (owner.explicitId ? owner.id === String(currentUser.id) : owner.name === currentUser.nama);
      })
    : livePrograms;

  const summary = calculateSummary(displayPrograms);
  const activeCount = statusCount(displayPrograms, "Sedang Dikerjakan");
  const doneCount = statusCount(displayPrograms, "Selesai Dikerjakan");

  // Category & Year filter states
  const [dashboardYearFilter, setDashboardYearFilter] = useState("");
  const [dashboardCategoryFilter, setDashboardCategoryFilter] = useState("");

  // Dynamic available years & categories
  const availableYears = Array.from(
    new Set(["2026", "2025", "2024", ...displayPrograms.map((p) => getProgramYear(p))])
  ).sort((a, b) => b.localeCompare(a));

  const availableCategories = Array.from(
    new Set([...standardCategories, ...displayPrograms.map((p) => p.kategori).filter(Boolean)])
  );

  // Filtered programs for dashboard cards
  const filteredDashboardPrograms = displayPrograms.filter((p) => {
    if (dashboardYearFilter && getProgramYear(p) !== dashboardYearFilter) return false;
    if (dashboardCategoryFilter && p.kategori !== dashboardCategoryFilter) return false;
    return true;
  });

  // Admin delete states
  const [confirmDeleteProgram, setConfirmDeleteProgram] = useState<Program | null>(null);
  const [confirmDeleteSurveyId, setConfirmDeleteSurveyId] = useState<string | null>(null);
  const [adminSearchTerm, setAdminSearchTerm] = useState("");

  // Filter advice for Operator
  const operatorAdvice = isOperator
    ? liveAdviceRecords.filter(
        (a) =>
          a.operatorPenerima === currentUser.nama ||
          a.operatorPenerima === "Belum ditugaskan" ||
          (a as AdviceRecord & { operatorId?: number | null }).operatorId === currentUser.id
      )
    : [];
  const pendingAdvice = operatorAdvice.filter((a) => a.status === "Belum ditindaklanjuti");
  const [selectedAdviceProgramId, setSelectedAdviceProgramId] = useState<number | "">(
    initialAdviceProgramId || ""
  );
  const [adviceText, setAdviceText] = useState("");
  const [adviceError, setAdviceError] = useState("");
  const adviceSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (initialAdviceProgramId) {
      setTimeout(() => {
        adviceSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
      onClearInitialAdviceProgramId?.();
    }
  }, [initialAdviceProgramId, onClearInitialAdviceProgramId, adviceSectionRef]);

  const selectedAdviceProgram = livePrograms.find((p) => p.id === selectedAdviceProgramId);
  const recipientOperator = selectedAdviceProgram
    ? operatorAssignment(selectedAdviceProgram)?.name || selectedAdviceProgram.operatorPengelola || "Belum ditugaskan"
    : "";

  const handleAdviceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdviceProgramId || !adviceText.trim()) {
      setAdviceError("Kegiatan dan isi saran wajib diisi.");
      return;
    }

    try {
      setIsSubmittingAdvice(true);
      setAdviceError("");
      const operatorId = selectedAdviceProgram?.operatorPengelolaId
        ? Number(selectedAdviceProgram.operatorPengelolaId)
        : null;

      await adviceApi.create({
        idKegiatan: selectedAdviceProgram!.id,
        namaKegiatan: selectedAdviceProgram!.nama,
        operatorPenerima: recipientOperator,
        operatorId,
        isi: adviceText.trim(),
      });

      await onAdviceCreated?.();

      // Fetch fresh advice list from API
      try {
        const fresh = await fetchAllApiPages((page, pageSize) => adviceApi.list({ page, pageSize }));
        setLiveAdviceRecords(fresh.map(mapApiAdviceToAdvice));
      } catch {
        // Fallback optimistic update
      }

      setSelectedAdviceProgramId("");
      setAdviceText("");
      setFeedbackNotice("Saran dan arahan berhasil dikirim ke backend.");
      setTimeout(() => setFeedbackNotice(null), 3500);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setAdviceError(err.message);
      } else {
        setAdviceError("Gagal menyimpan saran. Silakan periksa koneksi Anda.");
      }
    } finally {
      setIsSubmittingAdvice(false);
    }
  };

  const handleConfirmDeleteProgram = async () => {
    if (!confirmDeleteProgram) return;
    try {
      setIsDeleting(true);
      await programApi.remove(confirmDeleteProgram.id);
      setLivePrograms((prev) => prev.filter((p) => p.id !== confirmDeleteProgram.id));
      setConfirmDeleteProgram(null);
      setFeedbackNotice(`Kegiatan "${confirmDeleteProgram.nama}" berhasil dihapus.`);
      setTimeout(() => setFeedbackNotice(null), 3500);
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : "Gagal menghapus kegiatan.";
      setFeedbackError(msg);
      setTimeout(() => setFeedbackError(null), 4000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmDeleteSurvey = async () => {
    if (!confirmDeleteSurveyId) return;
    try {
      setIsDeleting(true);
      await surveyApi.remove(confirmDeleteSurveyId);
      setLiveSurveys((prev) => prev.filter((s) => s.id !== confirmDeleteSurveyId));
      setConfirmDeleteSurveyId(null);
      setFeedbackNotice("Data survey lapangan berhasil dihapus.");
      setTimeout(() => setFeedbackNotice(null), 3500);
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : "Gagal menghapus survey.";
      setFeedbackError(msg);
      setTimeout(() => setFeedbackError(null), 4000);
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    // Live state
    livePrograms,
    liveSurveys,
    liveAdviceRecords,
    setLivePrograms,
    setLiveSurveys,
    setLiveAdviceRecords,
    isLoading,
    setIsLoading,
    isSubmittingAdvice,
    isDeleting,
    feedbackNotice,
    feedbackError,
    setFeedbackNotice,
    setFeedbackError,

    // Derived data
    isOperator,
    isPimpnin,
    isAdmin,
    displayPrograms,
    summary,
    activeCount,
    doneCount,
    availableYears,
    availableCategories,
    filteredDashboardPrograms,
    operatorAdvice,
    pendingAdvice,
    selectedAdviceProgram,
    recipientOperator,

    // UI states
    dashboardYearFilter,
    setDashboardYearFilter,
    dashboardCategoryFilter,
    setDashboardCategoryFilter,
    confirmDeleteProgram,
    setConfirmDeleteProgram,
    confirmDeleteSurveyId,
    setConfirmDeleteSurveyId,
    adminSearchTerm,
    setAdminSearchTerm,
    selectedAdviceProgramId,
    setSelectedAdviceProgramId,
    adviceText,
    setAdviceText,
    adviceError,
    setAdviceError,
    adviceSectionRef,

    // Actions
    refreshDashboardData,
    handleAdviceSubmit,
    handleConfirmDeleteProgram,
    handleConfirmDeleteSurvey,
  };
}
