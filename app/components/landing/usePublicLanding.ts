"use client";

import { useCallback, useEffect, useState } from "react";
import {
  programApi,
  type DocumentationPhoto,
  type PublicProgram,
} from "@/lib/api";
import { mapPublicProgramToProgram } from "../../utils/api-mappers";
import {
  calculateSummary,
  statusCount,
  currency,
  quantity,
  getProgramYear,
  getProgramDesa,
  getProgramKecamatan,
} from "../../utils/helpers";
import { PROGRAM_STATUS_LABELS } from "../../utils/api-mappers";
import { Program } from "../../types";
import { ActivityFilters } from "../views/ActivityFilters";

const PUBLIC_PROGRAMS_PAGE_SIZE = 100;

export interface UsePublicLandingReturn {
  landingYearFilter: string;
  setLandingYearFilter: (v: string) => void;
  landingCategoryFilter: string;
  setLandingCategoryFilter: (v: string) => void;
  programs: PublicProgram[];
  loading: boolean;
  error: string | null;
  refreshKey: number;
  setRefreshKey: (v: number) => void;
  heroIndex: number;
  setHeroIndex: (v: number) => void;
  documentationPhotos: DocumentationPhoto[];
  displayPrograms: Program[];
  documentationCards: Array<{
    key: string | number;
    src: string;
    alt: string;
    title: string;
    location: string;
    year: string;
    status: string;
    badgeClass: string;
    onClick: (() => void) | undefined;
  }>;
  availableYears: string[];
  availableCategories: string[];
  filteredProjects: ReturnType<typeof mapPublicProgramToProgram>[];
  summary: ReturnType<typeof calculateSummary>;
  activeCount: number;
  doneCount: number;
  paguBelumDitetapkan: boolean;
  triggerRefresh: () => void;
}

export function usePublicLanding({
  onSelectProgram,
}: {
  onSelectProgram: (id: number) => void;
}): UsePublicLandingReturn {
  const [landingYearFilter, setLandingYearFilter] = useState("");
  const [landingCategoryFilter, setLandingCategoryFilter] = useState("");
  const [programs, setPrograms] = useState<PublicProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [heroIndex, setHeroIndex] = useState(0);
  const [documentationPhotos, setDocumentationPhotos] = useState<
    DocumentationPhoto[]
  >([]);

  const displayPrograms = programs.map(mapPublicProgramToProgram);

  const documentationCards =
    documentationPhotos.length > 0
      ? documentationPhotos.slice(0, 6).map((photo) => {
          const programStatus = photo.program?.status;
          const statusLabel =
            programStatus &&
            programStatus in PROGRAM_STATUS_LABELS
              ? PROGRAM_STATUS_LABELS[
                  programStatus as keyof typeof PROGRAM_STATUS_LABELS
                ]
              : "Belum Dikerjakan";
          const badgeClass =
            statusLabel === "Selesai Dikerjakan"
              ? "selesai"
              : statusLabel === "Sedang Dikerjakan"
              ? "sedang"
              : "belum";
          const prog = photo.program;
          return {
            key: photo.id,
            src: photo.downloadUrl,
            alt: photo.caption ?? photo.originalName,
            title: prog?.nama ?? photo.originalName,
            location: prog?.lokasi ?? "Kabupaten Kuningan",
            year: new Date(photo.createdAt).getFullYear().toString(),
            status: statusLabel,
            badgeClass,
            onClick: prog != null ? () => onSelectProgram(prog.id) : undefined,
          };
        })
      : [];

  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const firstPage = await programApi.public({
        page: 1,
        pageSize: PUBLIC_PROGRAMS_PAGE_SIZE,
      });
      const items: PublicProgram[] = [...firstPage.data];
      for (let page = 2; page <= firstPage.meta.totalPages; page += 1) {
        const nextPage = await programApi.public({
          page,
          pageSize: PUBLIC_PROGRAMS_PAGE_SIZE,
        });
        items.push(...nextPage.data);
      }
      setPrograms(items);
    } catch (err) {
      setError("Gagal memuat data kegiatan dari server.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDocumentationPhotos = useCallback(async () => {
    try {
      const { data } = await programApi.documentation();
      setDocumentationPhotos(data ?? []);
    } catch (err) {
      console.error("Gagal memuat foto dokumentasi:", err);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchPrograms();
      await fetchDocumentationPhotos();
    };

    load();
    const interval = setInterval(() => {
      void fetchPrograms();
      void fetchDocumentationPhotos();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchPrograms, fetchDocumentationPhotos, refreshKey]);

  const triggerRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const availableYears = Array.from(
    new Set([
      "2026",
      "2025",
      "2024",
      ...displayPrograms.map((p) => getProgramYear(p)),
    ])
  ).sort((a, b) => b.localeCompare(a));

  const availableCategories = Array.from(
    new Set([...displayPrograms.map((p) => p.kategori).filter(Boolean)])
  );

  const filteredProjects = displayPrograms.filter((p) => {
    if (landingYearFilter && getProgramYear(p) !== landingYearFilter)
      return false;
    if (landingCategoryFilter && p.kategori !== landingCategoryFilter)
      return false;
    return true;
  });

  const summary = calculateSummary(filteredProjects);
  const activeCount = statusCount(filteredProjects, "Sedang Dikerjakan");
  const doneCount = statusCount(filteredProjects, "Selesai Dikerjakan");
  const paguBelumDitetapkan =
    filteredProjects.length > 0 &&
    filteredProjects.every((p) => (p.pagu ?? 0) <= 0);

  return {
    landingYearFilter,
    setLandingYearFilter,
    landingCategoryFilter,
    setLandingCategoryFilter,
    programs,
    loading,
    error,
    refreshKey,
    setRefreshKey,
    heroIndex,
    setHeroIndex,
    documentationPhotos,
    displayPrograms,
    documentationCards,
    availableYears,
    availableCategories,
    filteredProjects,
    summary,
    activeCount,
    doneCount,
    paguBelumDitetapkan,
    triggerRefresh,
  };
}
