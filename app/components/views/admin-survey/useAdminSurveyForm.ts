"use client";

import { useCallback, useState } from "react";
import { FieldSurvey, Program, User } from "../../../types";

export interface UseAdminSurveyFormReturn {
  // Filter state
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  filterKategori: string;
  setFilterKategori: (v: string) => void;
  filterStatusKonversi: "all" | "unconverted" | "converted";
  setFilterStatusKonversi: (v: "all" | "unconverted" | "converted") => void;
  filterUrgensi: string;
  setFilterUrgensi: (v: string) => void;
  filterKecamatan: string;
  setFilterKecamatan: (v: string) => void;

  // Selection state
  selectedSurveyId: string | null;
  setSelectedSurveyId: (id: string | null) => void;
  detailSurvey: FieldSurvey | null;

  // Conversion modal state
  convertingSurvey: FieldSurvey | null;
  setConvertingSurvey: (s: FieldSurvey | null) => void;
  convertedNama: string;
  setConvertedNama: (v: string) => void;
  convertedKategori: string;
  setConvertedKategori: (v: string) => void;
  convertedPagu: number | "";
  setConvertedPagu: (v: number | "") => void;
  convertedTarget: number | "";
  setConvertedTarget: (v: number | "") => void;
  convertedSatuan: string;
  setConvertedSatuan: (v: string) => void;
  convertedKecamatan: string;
  setConvertedKecamatan: (v: string) => void;
  convertedDesa: string;
  setConvertedDesa: (v: string) => void;
  convertedDetailLokasi: string;
  setConvertedDetailLokasi: (v: string) => void;
  convertedOperatorId: string;
  setConvertedOperatorId: (v: string) => void;

  // Derived
  operatorOptions: User[];
  filteredSurveys: FieldSurvey[];
  totalSurveys: number;
  unconvertedCount: number;
  convertedCount: number;
  totalEstimasiUnconverted: number;

  // Handlers
  handleOpenConversionModal: (srv: FieldSurvey, e?: React.MouseEvent) => void;
  handleConfirmConversion: (e: React.FormEvent) => void;
  resetFilters: () => void;
}

export function useAdminSurveyForm({
  currentUser,
  surveys,
  programs,
  operators,
}: {
  currentUser: User;
  surveys: FieldSurvey[];
  programs: Program[];
  operators: User[];
}): UseAdminSurveyFormReturn {
  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [filterStatusKonversi, setFilterStatusKonversi] = useState<
    "all" | "unconverted" | "converted"
  >("all");
  const [filterUrgensi, setFilterUrgensi] = useState("");
  const [filterKecamatan, setFilterKecamatan] = useState("");

  // Selection state
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);

  // Conversion modal state
  const [convertingSurvey, setConvertingSurvey] = useState<FieldSurvey | null>(
    null
  );
  const [convertedNama, setConvertedNama] = useState("");
  const [convertedKategori, setConvertedKategori] = useState("Jalan Lingkungan");
  const [convertedPagu, setConvertedPagu] = useState<number | "">("");
  const [convertedTarget, setConvertedTarget] = useState<number | "">("");
  const [convertedSatuan, setConvertedSatuan] = useState("Meter persegi (m²)");
  const [convertedKecamatan, setConvertedKecamatan] = useState("");
  const [convertedDesa, setConvertedDesa] = useState("");
  const [convertedDetailLokasi, setConvertedDetailLokasi] = useState("");
  const [convertedOperatorId, setConvertedOperatorId] = useState("");

  const operatorOptions = operators.filter((u) => u.role === "Operator");

  const detailSurvey: FieldSurvey | null = selectedSurveyId
    ? surveys.find((s) => s.id === selectedSurveyId) ?? null
    : null;

  const getConnectedProgram = (srv: FieldSurvey): Program | undefined => {
    if (!srv.programId) return undefined;
    return programs.find((p) => p.id === srv.programId);
  };

  const filteredSurveys = surveys.filter((s) => {
    const connected = getConnectedProgram(s);
    const isConverted = !!connected || s.status === "Dikonversi";

    if (filterStatusKonversi === "unconverted" && isConverted) return false;
    if (filterStatusKonversi === "converted" && !isConverted) return false;
    if (filterKategori && s.kategori !== filterKategori) return false;
    if (filterUrgensi && s.tingkatUrgensi !== filterUrgensi) return false;
    if (filterKecamatan && s.kecamatan !== filterKecamatan) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        s.namaKegiatan.toLowerCase().includes(q) ||
        s.kodeSurvey.toLowerCase().includes(q) ||
        s.desaKelurahan.toLowerCase().includes(q) ||
        s.kecamatan.toLowerCase().includes(q) ||
        s.detailLokasi.toLowerCase().includes(q) ||
        s.surveyor.toLowerCase().includes(q) ||
        s.uraianTemuan.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const totalSurveys = surveys.length;
  const unconvertedCount = surveys.filter(
    (s) => !getConnectedProgram(s) && s.status !== "Dikonversi"
  ).length;
  const convertedCount = surveys.filter(
    (s) => !!getConnectedProgram(s) || s.status === "Dikonversi"
  ).length;
  const totalEstimasiUnconverted = surveys
    .filter((s) => !getConnectedProgram(s) && s.status !== "Dikonversi")
    .reduce((acc, curr) => acc + (curr.estimasiBiaya || 0), 0);

  const handleOpenConversionModal = useCallback(
    (srv: FieldSurvey, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      setConvertingSurvey(srv);
      setConvertedNama(srv.namaKegiatan);
      setConvertedKategori(srv.kategori || "Jalan Lingkungan");
      setConvertedPagu(srv.estimasiBiaya || 0);
      setConvertedTarget(srv.luasVolume || srv.panjang || 1);
      setConvertedSatuan(
        srv.satuan ||
          (srv.kategori === "Drainase/TPT" ||
          srv.kategori === "Jalan Lingkungan"
            ? "m'"
            : "m2")
      );
      setConvertedKecamatan(srv.kecamatan);
      setConvertedDesa(srv.desaKelurahan);
      setConvertedDetailLokasi(srv.detailLokasi);
      const surveyorOp = operatorOptions.find(
        (op) => op.nama === srv.surveyor || op.email === srv.surveyor
      );
      setConvertedOperatorId(surveyorOp ? String(surveyorOp.id) : "");
    },
    [operatorOptions]
  );

  const handleConfirmConversion = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!convertingSurvey) return;

      const selectedOperator = operatorOptions.find(
        (op) => String(op.id) === convertedOperatorId
      );

      // This is called from the modal form onSubmit; parent handles the actual API call
      // via onCreateProgramFromSurvey prop. Here we just prepare data.
    },
    [convertingSurvey, convertedOperatorId, operatorOptions]
  );

  const resetFilters = useCallback(() => {
    setSearchTerm("");
    setFilterKategori("");
    setFilterStatusKonversi("all");
    setFilterUrgensi("");
    setFilterKecamatan("");
  }, []);

  return {
    // Filter state
    searchTerm,
    setSearchTerm,
    filterKategori,
    setFilterKategori,
    filterStatusKonversi,
    setFilterStatusKonversi,
    filterUrgensi,
    setFilterUrgensi,
    filterKecamatan,
    setFilterKecamatan,

    // Selection state
    selectedSurveyId,
    setSelectedSurveyId,
    detailSurvey,

    // Conversion modal state
    convertingSurvey,
    setConvertingSurvey,
    convertedNama,
    setConvertedNama,
    convertedKategori,
    setConvertedKategori,
    convertedPagu,
    setConvertedPagu,
    convertedTarget,
    setConvertedTarget,
    convertedSatuan,
    setConvertedSatuan,
    convertedKecamatan,
    setConvertedKecamatan,
    convertedDesa,
    setConvertedDesa,
    convertedDetailLokasi,
    setConvertedDetailLokasi,
    convertedOperatorId,
    setConvertedOperatorId,

    // Derived
    operatorOptions,
    filteredSurveys,
    totalSurveys,
    unconvertedCount,
    convertedCount,
    totalEstimasiUnconverted,

    // Handlers
    handleOpenConversionModal,
    handleConfirmConversion,
    resetFilters,
  };
}
