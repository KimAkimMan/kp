"use client";

import React, { useState } from "react";
import {
  Plus,
  FileBarChart,
  Send,
  AlertCircle,
  MessageSquare,
  ClipboardCheck,
  Trash2,
  Search,
  Calendar,
  Layers,
} from "lucide-react";
import { Program, User, AdviceRecord, PageType, FieldSurvey } from "../../types";
import {
  calculateSummary,
  statusCount,
  currency,
  quantity,
  operatorAssignment,
  getProgramDesa,
  getProgramKecamatan,
  getProgramYear,
} from "../../utils/helpers";
import { SimpleBarChart } from "../Charts";
import { PimpinanAchievementSection } from "../PimpinanAchievementSection";

interface DashboardViewProps {
  currentUser: User;
  programs: Program[];
  adviceRecords: AdviceRecord[];
  surveys?: FieldSurvey[];
  onAddAdvice: (record: Omit<AdviceRecord, "id" | "tanggal" | "status">) => void;
  onNavigate: (page: PageType) => void;
  onSelectProgram: (id: number) => void;
  onDeleteProgram?: (p: Program) => void;
  onDeleteSurvey?: (surveyId: string) => void;
  initialAdviceProgramId?: number | null;
  onClearInitialAdviceProgramId?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  programs,
  adviceRecords,
  surveys = [],
  onAddAdvice,
  onNavigate,
  onSelectProgram,
  onDeleteProgram,
  onDeleteSurvey,
  initialAdviceProgramId,
  onClearInitialAdviceProgramId,
}) => {
  const isOperator = currentUser.role === "Operator";
  const isPimpinan = currentUser.role === "Pimpinan";
  const isAdmin = currentUser.role === "Admin";

  // Filter accessible programs for Operator
  const displayPrograms = isOperator
    ? programs.filter((p) => {
        const owner = operatorAssignment(p);
        return !owner || (owner.explicitId ? owner.id === String(currentUser.id) : owner.name === currentUser.nama);
      })
    : programs;

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
    new Set([...displayPrograms.map((p) => p.kategori).filter(Boolean)])
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
    ? adviceRecords.filter(
        (a) =>
          a.operatorPenerima === currentUser.nama ||
          a.operatorPenerima === "Belum ditugaskan"
      )
    : [];
  const pendingAdvice = operatorAdvice.filter(
    (a) => a.status === "Belum ditindaklanjuti"
  );
  const [selectedAdviceProgramId, setSelectedAdviceProgramId] = useState<number | "">(
    initialAdviceProgramId || ""
  );
  const [adviceText, setAdviceText] = useState("");
  const [adviceError, setAdviceError] = useState("");
  const adviceSectionRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (initialAdviceProgramId) {
      setSelectedAdviceProgramId(initialAdviceProgramId);
      setTimeout(() => {
        adviceSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
      onClearInitialAdviceProgramId?.();
    }
  }, [initialAdviceProgramId, onClearInitialAdviceProgramId]);

  const selectedAdviceProgram = programs.find((p) => p.id === selectedAdviceProgramId);
  const recipientOperator = selectedAdviceProgram
    ? operatorAssignment(selectedAdviceProgram)?.name || selectedAdviceProgram.pj || "Belum ditugaskan"
    : "";

  const handleAdviceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdviceProgramId || !adviceText.trim()) {
      setAdviceError("Kegiatan dan isi saran wajib diisi.");
      return;
    }

    onAddAdvice({
      idKegiatan: selectedAdviceProgram!.id,
      namaKegiatan: selectedAdviceProgram!.nama,
      identitasPimpinan: currentUser.nama,
      operatorPenerima: recipientOperator,
      isi: adviceText.trim(),
    });

    setSelectedAdviceProgramId("");
    setAdviceText("");
    setAdviceError("");
  };

  const handleConfirmDeleteProgram = () => {
    if (confirmDeleteProgram && onDeleteProgram) {
      onDeleteProgram(confirmDeleteProgram);
      setConfirmDeleteProgram(null);
    }
  };

  const handleConfirmDeleteSurvey = () => {
    if (confirmDeleteSurveyId && onDeleteSurvey) {
      onDeleteSurvey(confirmDeleteSurveyId);
      setConfirmDeleteSurveyId(null);
    }
  };

  const adminFilteredPrograms = isAdmin
    ? programs.filter((p) => {
        const matchesQuery = (p.nama + " " + p.kode + " " + (p.penyedia || "") + " " + (p.pj || ""))
          .toLowerCase()
          .includes(adminSearchTerm.toLowerCase());
        const matchesYear = !dashboardYearFilter || getProgramYear(p) === dashboardYearFilter;
        const matchesCategory = !dashboardCategoryFilter || p.kategori === dashboardCategoryFilter;
        return matchesQuery && matchesYear && matchesCategory;
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#143965]">
            {isAdmin && "Dashboard Admin"}
            {isOperator && "Dashboard Operator"}
            {isPimpinan && "Dashboard Pimpinan"}
          </h2>
          <p className="text-xs sm:text-sm text-[#65778B] mt-0.5">
            {isAdmin && "Kelola master kegiatan, sortir kategori tahun anggaran, serta pantau target dan realisasi."}
            {isOperator && "Pantau kegiatan yang Anda kelola per kategori tahun, realisasi lapangan, dan jadwal."}
            {isPimpinan && "Ringkasan capaian target dan akumulasi anggaran seluruh kegiatan permukiman."}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => onNavigate("masteractivities")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-[#1E4E8C] text-white hover:bg-[#143965] transition shadow-xs"
          >
            <Plus className="w-4 h-4" /> Tambah Kegiatan
          </button>
        )}

        {isPimpinan && (
          <button
            onClick={() => onNavigate("reports")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-[#1E4E8C] text-white hover:bg-[#143965] transition shadow-xs"
          >
            <FileBarChart className="w-4 h-4" /> Tinjau Laporan
          </button>
        )}
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <article className="bg-white rounded-2xl p-5 border border-[#E1E9F0] shadow-xs card-indicator">
          <p className="text-xs font-semibold text-[#65778B] m-0">Jumlah Kegiatan</p>
          <strong className="block text-2xl font-bold text-[#143965] mt-1.5">
            {displayPrograms.length}
          </strong>
          <span className="text-[11px] text-[#65778B] block mt-1">Data keseluruhan dinas</span>
        </article>

        <article className="bg-white rounded-2xl p-5 border border-[#E1E9F0] shadow-xs card-indicator teal">
          <p className="text-xs font-semibold text-[#65778B] m-0">Sedang Dikerjakan</p>
          <strong className="block text-2xl font-bold text-[#148B87] mt-1.5">
            {activeCount}
          </strong>
          <span className="text-[11px] text-[#65778B] block mt-1">Dalam pengerjaan</span>
        </article>

        <article className="bg-white rounded-2xl p-5 border border-[#E1E9F0] shadow-xs card-indicator green">
          <p className="text-xs font-semibold text-[#65778B] m-0">Selesai Dikerjakan</p>
          <strong className="block text-2xl font-bold text-[#258050] mt-1.5">
            {doneCount}
          </strong>
          <span className="text-[11px] text-[#65778B] block mt-1">Telah tercapai 100%</span>
        </article>

        <article className="bg-white rounded-2xl p-5 border border-[#E1E9F0] shadow-xs card-indicator orange">
          <p className="text-xs font-semibold text-[#65778B] m-0">Sisa Anggaran</p>
          <strong className="block text-xl font-bold text-[#E78A31] mt-1.5 truncate">
            {currency(summary.sisaAnggaran)}
          </strong>
          <span className="text-[11px] text-[#65778B] block mt-1">Dari seluruh pagu</span>
        </article>
      </div>

      {/* Admin: Banner Hasil Survey Operator Menunggu */}
      {isAdmin && surveys.length > 0 && (
        <section className="bg-white rounded-2xl p-6 border border-[#E1E9F0] shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-[#EAF0F4]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8F2F8] text-[#1E4E8C] flex items-center justify-center shrink-0">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-[#143965]">
                    Hasil Survey Lapangan Operator
                  </h3>
                  <span className="badge belum bg-[#FFF0E2] text-[#E78A31] border border-[#FCDDC0] font-bold text-[11px]">
                    {surveys.filter((s) => !s.programId).length} Belum Jadi Kegiatan
                  </span>
                </div>
                <p className="text-xs text-[#65778B] mt-0.5">
                  Tinjau usulan hasil survey operator, konversi jadi kegiatan resmi, atau hapus data survey yang tidak valid.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate("adminsurvey")}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#1E4E8C] text-white hover:bg-[#143965] transition shadow-xs shrink-0"
            >
              Buka Hasil Survey Operator →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {surveys.slice(0, 3).map((srv) => (
              <div
                key={srv.id}
                onClick={() => onNavigate("adminsurvey")}
                className="p-3.5 rounded-xl border border-[#E1E9F0] bg-[#FAFBFD] hover:border-[#1E4E8C]/30 hover:shadow-xs transition cursor-pointer relative group"
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-mono text-[#65778B]">{srv.kodeSurvey}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-[#1E4E8C]">{srv.kategori}</span>
                    {onDeleteSurvey && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteSurveyId(srv.id);
                        }}
                        className="p-1 rounded text-[#BD493B] hover:bg-[#FDEEED] transition"
                        title="Hapus survey ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <h4 className="text-xs font-bold text-[#143965] line-clamp-1">
                  {srv.namaKegiatan}
                </h4>
                <p className="text-[11px] text-[#65778B] mt-0.5 line-clamp-1">
                  {srv.desaKelurahan}, Kec. {srv.kecamatan}
                </p>
                <div className="mt-2 pt-2 border-t border-[#EAF0F4] flex items-center justify-between text-[11px]">
                  <span className="text-[#65778B]">Oleh: {srv.surveyor}</span>
                  <span className="font-bold text-[#148B87]">
                    {srv.estimasiBiaya ? currency(srv.estimasiBiaya) : "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Operator: Banner Arahan Pimpinan */}
      {isOperator && operatorAdvice.length > 0 && (
        <section className="bg-gradient-to-r from-[#FFFDFB] to-[#FEF6EE] rounded-2xl p-5 border border-[#FAD8B8] shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FFF0E2] text-[#E78A31] flex items-center justify-center shrink-0 mt-0.5">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-[#143965]">
                    Arahan &amp; Evaluasi dari Pimpinan
                  </h3>
                  {pendingAdvice.length > 0 ? (
                    <span className="badge belum bg-[#FFF0E2] text-[#E78A31] border border-[#FCDDC0] font-bold text-[11px]">
                      {pendingAdvice.length} Belum Ditindaklanjuti
                    </span>
                  ) : (
                    <span className="badge selesai font-semibold text-[11px]">
                      Semua Telah Ditindaklanjuti
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#65778B] mt-1 max-w-2xl leading-relaxed">
                  {pendingAdvice.length > 0
                    ? `Pimpinan (${pendingAdvice[0].identitasPimpinan}) memberikan arahan: "${pendingAdvice[0].isi.slice(0, 80)}${
                        pendingAdvice[0].isi.length > 80 ? "..." : ""
                      }". Buka menu Profil &amp; Notifikasi untuk melihat detail instruksi.`
                    : "Tidak ada arahan tertunda. Seluruh instruksi pimpinan telah ditindaklanjuti."}
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate("profile")}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#1E4E8C] text-white hover:bg-[#143965] transition shadow-xs shrink-0"
            >
              Buka Profil &amp; Notifikasi →
            </button>
          </div>
        </section>
      )}

      {/* Operator: Form & Monitoring Survey Lapangan */}
      {isOperator && (
        <section className="bg-white rounded-2xl p-6 border border-[#E1E9F0] shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 pb-4 border-b border-[#EAF0F4]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8F2F8] text-[#1E4E8C] flex items-center justify-center shrink-0">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#143965]">
                  Form Survey Lapangan Permukiman
                </h3>
                <p className="text-xs text-[#65778B] mt-0.5">
                  Pendataan teknis kondisi fisik, verifikasi titik nol (0%), dan dokumentasi kerusakan infrastruktur permukiman.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => onNavigate("survey")}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#1E4E8C] text-white hover:bg-[#143965] transition shadow-xs"
              >
                <Plus className="w-4 h-4" /> Buka Form Survey
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            <div className="p-3.5 rounded-xl border border-[#DFEAF0] bg-[#FBFDFE]">
              <span className="text-[11px] text-[#65778B] font-semibold block">Total Data Survey</span>
              <strong className="text-lg font-bold text-[#143965] block mt-0.5">
                {surveys.length} Titik Lokasi
              </strong>
            </div>
            <div className="p-3.5 rounded-xl border border-[#DFEAF0] bg-[#FBFDFE]">
              <span className="text-[11px] text-[#65778B] font-semibold block">Kondisi Rusak Berat/Sedang</span>
              <strong className="text-lg font-bold text-[#BD493B] block mt-0.5">
                {surveys.filter((s) => s.kondisi === "Rusak Berat" || s.kondisi === "Rusak Sedang").length} Lokasi
              </strong>
            </div>
            <div className="p-3.5 rounded-xl border border-[#DFEAF0] bg-[#FBFDFE]">
              <span className="text-[11px] text-[#65778B] font-semibold block">Estimasi Kebutuhan Usulan</span>
              <strong className="text-lg font-bold text-[#148B87] block mt-0.5 truncate">
                {currency(surveys.reduce((acc, curr) => acc + (curr.estimasiBiaya || 0), 0))}
              </strong>
            </div>
          </div>

          {surveys.length > 0 ? (
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-[#35536F] uppercase tracking-wider">
                  Hasil Survey Lapangan Terkini
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {surveys.slice(0, 3).map((srv) => {
                  const badgeKondisi =
                    srv.kondisi === "Baik"
                      ? "bg-[#E7F6ED] text-[#258050] border-[#C8E8D5]"
                      : srv.kondisi === "Rusak Ringan"
                      ? "bg-[#FEF7E9] text-[#B07300] border-[#FCE6BD]"
                      : srv.kondisi === "Rusak Sedang"
                      ? "bg-[#FFF3E8] text-[#BD6C1E] border-[#FCDDC0]"
                      : "bg-[#FDEEED] text-[#BD493B] border-[#F8C8C4]";

                  return (
                    <div
                      key={srv.id}
                      onClick={() => onNavigate("survey")}
                      className="p-4 rounded-xl border border-[#E1E9F0] bg-[#FAFCFD] hover:border-[#A8C9DC] hover:shadow-xs transition cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeKondisi}`}>
                            {srv.kondisi}
                          </span>
                          <span className="text-[11px] text-[#65778B] font-mono">{srv.kodeSurvey}</span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-[#143965] line-clamp-1 mb-1">
                          {srv.namaKegiatan}
                        </h4>
                        <p className="text-[11px] text-[#65778B] line-clamp-2 mb-2">
                          {srv.detailLokasi || `${srv.desaKelurahan}, Kec. ${srv.kecamatan}`}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#EAF0F4] flex items-center justify-between text-[11px]">
                        <span className="text-[#65778B]">{srv.tanggal}</span>
                        <span className="font-bold text-[#148B87]">
                          {srv.estimasiBiaya ? currency(srv.estimasiBiaya) : srv.kategori}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 border border-dashed border-[#CCD9E4] rounded-xl text-xs text-[#65778B]">
              Belum ada survey lapangan yang tercatat. Klik tombol di atas untuk mengisi formulir survey pertama.
            </div>
          )}
        </section>
      )}

      {/* Pimpinan Achievement Section */}
      {isPimpinan && <PimpinanAchievementSection programs={displayPrograms} />}

      {/* Pimpinan Advice Box */}
      {isPimpinan && (
        <section
          ref={adviceSectionRef}
          id="kotak-saran"
          className="bg-white rounded-2xl p-6 border border-[#E1E9F0] shadow-xs scroll-mt-6"
        >
          <h3 className="text-base font-bold text-[#143965] mb-1">
            Saran dan Arahan Pimpinan
          </h3>
          <p className="text-xs text-[#65778B] mb-4">
            Sampaikan arahan kepada Operator berdasarkan kegiatan yang tersedia untuk ditindaklanjuti di lapangan.
          </p>

          <form onSubmit={handleAdviceSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                  Pilih Kegiatan
                </label>
                <select
                  value={selectedAdviceProgramId}
                  onChange={(e) => setSelectedAdviceProgramId(Number(e.target.value) || "")}
                  className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
                  required
                >
                  <option value="">-- Pilih kegiatan --</option>
                  {displayPrograms.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                  Operator Penerima
                </label>
                <input
                  type="text"
                  value={recipientOperator}
                  readOnly
                  placeholder="Pilih kegiatan terlebih dahulu"
                  className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-[#F6F9FB] text-[#65778B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                Isi Saran / Arahan
              </label>
              <textarea
                value={adviceText}
                onChange={(e) => setAdviceText(e.target.value)}
                rows={3}
                placeholder="Tuliskan saran perbaikan, arahan percepatan, atau evaluasi..."
                className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
                required
              />
            </div>

            {adviceError && (
              <div className="flex items-center gap-1.5 text-xs text-[#C44C3B] font-semibold">
                <AlertCircle className="w-4 h-4" /> {adviceError}
              </div>
            )}

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#1E4E8C] text-white hover:bg-[#143965] transition shadow-xs"
            >
              <Send className="w-4 h-4" /> Simpan Saran
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#EAF0F4]">
            <h4 className="text-sm font-bold text-[#143965] mb-3">
              Riwayat Arahan Tersimpan ({adviceRecords.length})
            </h4>
            {adviceRecords.length > 0 ? (
              <div className="overflow-x-auto border border-[#E3EBF0] rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F6F9FB] text-[#61738A] uppercase font-bold text-[11px]">
                    <tr>
                      <th className="p-3">Kegiatan</th>
                      <th className="p-3">Operator</th>
                      <th className="p-3">Saran / Arahan</th>
                      <th className="p-3">Tanggal</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAF0F4]">
                    {adviceRecords
                      .slice()
                      .reverse()
                      .map((r) => (
                        <tr key={r.id} className="hover:bg-[#FBFDFE]">
                          <td className="p-3 font-semibold text-[#143965]">{r.namaKegiatan}</td>
                          <td className="p-3 text-[#65778B]">{r.operatorPenerima}</td>
                          <td className="p-3 text-[#18304B]">{r.isi}</td>
                          <td className="p-3 text-[#65778B] whitespace-nowrap">{r.tanggal}</td>
                          <td className="p-3">
                            <span className="badge belum">{r.status}</span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-[#65778B] border border-dashed border-[#CCD9E4] rounded-xl text-xs">
                Belum ada saran dan arahan tersimpan.
              </div>
            )}
          </div>
        </section>
      )}

      {/* Akumulasi Anggaran dan Pagu */}
      <section className="bg-white rounded-2xl p-6 border border-[#E1E9F0] shadow-xs">
        <h3 className="text-base font-bold text-[#143965] mb-1">
          Akumulasi Anggaran dan Pagu
        </h3>
        <p className="text-xs text-[#65778B] mb-5">
          Pagu, penggunaan, dan sisa anggaran diperbarui secara otomatis dari kegiatan dinas.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          <div className="p-3.5 rounded-xl border border-[#DFEAF0] bg-[#FBFDFE]">
            <p className="text-xs text-[#65778B] m-0">Pagu Total</p>
            <strong className="block text-base sm:text-lg font-bold text-[#143965] mt-1 truncate">
              {currency(summary.pagu)}
            </strong>
          </div>
          <div className="p-3.5 rounded-xl border border-[#DFEAF0] bg-[#FBFDFE]">
            <p className="text-xs text-[#65778B] m-0">Total Penggunaan</p>
            <strong className="block text-base sm:text-lg font-bold text-[#148B87] mt-1 truncate">
              {currency(summary.penggunaan)}
            </strong>
          </div>
          <div className="p-3.5 rounded-xl border border-[#DFEAF0] bg-[#FBFDFE]">
            <p className="text-xs text-[#65778B] m-0">Sisa Anggaran</p>
            <strong className="block text-base sm:text-lg font-bold text-[#E78A31] mt-1 truncate">
              {currency(summary.sisaAnggaran)}
            </strong>
          </div>
          <div className="p-3.5 rounded-xl border border-[#DFEAF0] bg-[#FBFDFE]">
            <p className="text-xs text-[#65778B] m-0">Kegiatan Beranggaran</p>
            <strong className="block text-base sm:text-lg font-bold text-[#143965] mt-1">
              {summary.berpagu}
            </strong>
          </div>
          <div className="p-3.5 rounded-xl border border-[#DFEAF0] bg-[#FBFDFE]">
            <p className="text-xs text-[#65778B] m-0">Belum Memiliki Pagu</p>
            <strong className="block text-base sm:text-lg font-bold text-[#143965] mt-1">
              {summary.tanpaPagu}
            </strong>
          </div>
        </div>

        {summary.pagu > 0 ? (
          <div>
            <SimpleBarChart
              labels={["Akumulasi Anggaran"]}
              datasets={[
                {
                  label: "Pagu Total",
                  data: [summary.pagu],
                  backgroundColor: "#1E4E8C",
                },
                {
                  label: "Penggunaan",
                  data: [summary.penggunaan],
                  backgroundColor: "#148B87",
                },
                {
                  label: "Sisa Anggaran",
                  data: [summary.sisaAnggaran],
                  backgroundColor: "#E78A31",
                },
              ]}
              formatValue={(v) => currency(v)}
              height={220}
            />
            <p className="text-[11px] text-[#65778B] mt-3">
              Legenda: Pagu Total (biru tua) · Penggunaan (teal) · Sisa Anggaran (oranye).
            </p>
          </div>
        ) : (
          <div className="text-center py-8 text-[#65778B] border border-dashed border-[#CCD9E4] rounded-xl text-xs">
            Belum ada nilai anggaran yang terdaftar.
          </div>
        )}
      </section>

      {/* Kegiatan Terkini with Category Sort & Admin Delete Ability */}
      <section className="bg-white rounded-2xl p-6 border border-[#E1E9F0] shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-[#143965]">Kegiatan Terkini</h3>
            <p className="text-xs text-[#65778B] mt-0.5">
              Pilih kategori tahun untuk melihat kegiatan spesifik tahun tersebut.
            </p>
          </div>
          <button
            onClick={() => onNavigate("programs")}
            className="text-xs font-bold text-[#1E4E8C] hover:underline"
          >
            Lihat Semua Kegiatan →
          </button>
        </div>

        {/* Category Pills by Year on Dashboard */}
        <div className="flex flex-wrap items-center gap-2 mb-4 pb-3 border-b border-[#EAF0F4]">
          <span className="text-[11px] font-bold text-[#65778B] flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[#1E4E8C]" /> Kategori Tahun:
          </span>
          <button
            type="button"
            onClick={() => setDashboardYearFilter("")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              !dashboardYearFilter
                ? "bg-[#1E4E8C] text-white shadow-xs"
                : "bg-[#F0F4F8] text-[#496178] hover:bg-[#E2EAF2]"
            }`}
          >
            Semua Tahun ({displayPrograms.length})
          </button>
          {availableYears.map((yr) => {
            const count = displayPrograms.filter((p) => getProgramYear(p) === yr).length;
            const isActive = dashboardYearFilter === yr;
            return (
              <button
                key={yr}
                type="button"
                onClick={() => setDashboardYearFilter(isActive ? "" : yr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#1E4E8C] text-white shadow-xs"
                    : "bg-[#F0F4F8] text-[#496178] hover:bg-[#E2EAF2]"
                }`}
              >
                <span>Tahun {yr}</span>
                <span className="text-[10px] opacity-80">({count})</span>
              </button>
            );
          })}

          {availableCategories.length > 0 && (
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-[11px] font-bold text-[#65778B] hidden md:inline-flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#148B87]" /> Bidang:
              </span>
              <select
                value={dashboardCategoryFilter}
                onChange={(e) => setDashboardCategoryFilter(e.target.value)}
                className="border border-[#CCD9E4] rounded-lg px-2.5 py-1 text-xs bg-white text-[#35536F] font-semibold"
              >
                <option value="">Semua Bidang</option>
                {availableCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {filteredDashboardPrograms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredDashboardPrograms.slice(0, 3).map((p) => {
              const badgeClass =
                p.status === "Belum Dikerjakan"
                  ? "belum"
                  : p.status === "Sedang Dikerjakan"
                  ? "sedang"
                  : "selesai";

              const desaDisplay = getProgramDesa(p);
              const kecamatanDisplay = getProgramKecamatan(p);
              const yearDisplay = getProgramYear(p);

              return (
                <div
                  key={p.id}
                  onClick={() => onSelectProgram(p.id)}
                  className="bg-[#FBFDFE] border border-[#E1E9F0] rounded-2xl p-5 hover:border-[#A8C9DC] hover:-translate-y-1 transition duration-200 shadow-xs cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E8F2F8] text-[#1E4E8C]">
                          TA {yearDisplay}
                        </span>
                        <span className={`badge ${badgeClass}`}>{p.status}</span>
                      </div>
                      {isAdmin && onDeleteProgram && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteProgram(p);
                          }}
                          className="p-1 rounded-lg text-[#BD493B] hover:bg-[#FDEEED] transition"
                          title="Hapus kegiatan ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <span className="text-[11px] text-[#65778B] font-mono">{p.kode}</span>
                    <h4 className="text-sm font-bold text-[#143965] mb-1.5 leading-snug">
                      {p.nama}
                    </h4>
                    <p className="text-xs text-[#65778B] line-clamp-1 mb-1">
                      <span className="font-semibold text-[#143965]">{desaDisplay}</span>, Kec. {kecamatanDisplay}
                    </p>
                  </div>
                  <div className="pt-2.5 border-t border-[#EAEFF4] text-xs">
                    <span className="text-[#65778B]">
                      Target:{" "}
                      <strong className="text-[#143965]">
                        {quantity(p.target, p.satuan)}
                      </strong>
                    </span>
                    <span className="block text-[#148B87] font-semibold mt-0.5">
                      Realisasi: {quantity(p.realisasi, p.satuan)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-[#65778B] border border-dashed border-[#CCD9E4] rounded-xl text-xs">
            Tidak ada kegiatan pada kategori yang dipilih.
          </div>
        )}
      </section>

      {/* Admin: Dedicated Quick Delete Data Panel */}
      {isAdmin && onDeleteProgram && (
        <section className="bg-white rounded-2xl p-6 border border-[#E1E9F0] shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-[#EAF0F4]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FDEEED] text-[#BD493B] flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#143965]">
                  Kuasa Hapus Data Kegiatan (Dashboard Admin)
                </h3>
                <p className="text-xs text-[#65778B] mt-0.5">
                  Sebagai Admin, Anda dapat menyortir per kategori tahun dan menghapus kegiatan dinas langsung dari sini.
                </p>
              </div>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[#718296] absolute left-3 top-2.5" />
              <input
                type="text"
                value={adminSearchTerm}
                onChange={(e) => setAdminSearchTerm(e.target.value)}
                placeholder="Cari kegiatan untuk dihapus..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-[#CCD9E4] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#8FC5E7]"
              />
            </div>
          </div>

          <div className="overflow-x-auto border border-[#E3EBF0] rounded-xl max-h-80">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F6F9FB] text-[#61738A] uppercase font-bold text-[11px] sticky top-0">
                <tr>
                  <th className="p-3">Tahun / Kode</th>
                  <th className="p-3">Nama Kegiatan</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Lokasi (Desa &amp; Kec)</th>
                  <th className="p-3">Pagu</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Aksi Hapus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAF0F4]">
                {adminFilteredPrograms.length > 0 ? (
                  adminFilteredPrograms.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FBFDFE]">
                      <td className="p-3 whitespace-nowrap">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E8F2F8] text-[#1E4E8C] mr-1.5">
                          TA {getProgramYear(p)}
                        </span>
                        <span className="font-mono text-[#65778B]">{p.kode}</span>
                      </td>
                      <td className="p-3 font-bold text-[#143965]">{p.nama}</td>
                      <td className="p-3 text-[#496178]">
                        <span className="bg-[#EDF5FB] text-[#1E4E8C] px-2 py-0.5 rounded text-[11px] font-semibold">
                          {p.kategori}
                        </span>
                      </td>
                      <td className="p-3 text-[#65778B]">
                        {getProgramDesa(p)}, Kec. {getProgramKecamatan(p)}
                      </td>
                      <td className="p-3 font-semibold text-[#143965] whitespace-nowrap">
                        {currency(p.pagu)}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="badge belum text-[10px]">{p.status}</span>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteProgram(p)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FDEEED] text-[#BD493B] hover:bg-[#F8C8C4] transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-[#65778B]">
                      Tidak ada kegiatan yang cocok untuk kategori yang dipilih.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Delete Program Confirmation Modal */}
      {confirmDeleteProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl border border-[#E1E9F0]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#FDEEED] text-[#BD493B] flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#143965]">Hapus Kegiatan</h3>
            </div>
            <p className="text-sm text-[#65778B] mb-5">
              Apakah Anda yakin ingin menghapus kegiatan{" "}
              <strong className="text-[#143965]">{confirmDeleteProgram.nama}</strong>? Data ini akan dihapus secara permanen.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDeleteProgram(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#F0F4F8] text-[#35536F] hover:bg-[#E1E9F0] transition"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDeleteProgram}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-[#BD493B] text-white hover:bg-[#9E3B2F] transition"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Survey Confirmation Modal */}
      {confirmDeleteSurveyId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl border border-[#E1E9F0]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#FDEEED] text-[#BD493B] flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#143965]">Hapus Survey Lapangan</h3>
            </div>
            <p className="text-sm text-[#65778B] mb-5">
              Apakah Anda yakin ingin menghapus data survey lapangan ini?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDeleteSurveyId(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#F0F4F8] text-[#35536F] hover:bg-[#E1E9F0] transition"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDeleteSurvey}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-[#BD493B] text-white hover:bg-[#9E3B2F] transition"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
