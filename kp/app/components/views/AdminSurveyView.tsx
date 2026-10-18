"use client";

import React, { useState } from "react";
import {
  ClipboardCheck,
  FolderPlus,
  Search,
  MapPin,
  Calendar,
  User as UserIcon,
  AlertTriangle,
  CheckCircle2,
  Eye,
  ExternalLink,
  Printer,
  X,
  ArrowRight,
  ArrowLeft,
  Layers,
  Sparkles,
  Info,
  Compass,
  FileCheck2,
  Clock,
  RotateCcw,
  Building2,
  FileText,
  BadgeAlert,
} from "lucide-react";
import { FieldSurvey, Program, User } from "../../types";
import { currency } from "../../utils/helpers";
import { defaultKecamatanList, standardCategories } from "../../data/initialData";

interface AdminSurveyViewProps {
  currentUser: User;
  surveys: FieldSurvey[];
  programs: Program[];
  onCreateProgramFromSurvey: (
    survey: FieldSurvey,
    customData?: Partial<Program>
  ) => void;
  onViewProgram?: (programId: number) => void;
}

export const AdminSurveyView: React.FC<AdminSurveyViewProps> = ({
  currentUser,
  surveys,
  programs,
  onCreateProgramFromSurvey,
  onViewProgram,
}) => {
  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [filterStatusKonversi, setFilterStatusKonversi] = useState<
    "all" | "unconverted" | "converted"
  >("all");
  const [filterUrgensi, setFilterUrgensi] = useState("");
  const [filterKecamatan, setFilterKecamatan] = useState("");

  // Dedicated Detail Page state: holds id of survey being viewed in full detail
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);

  // Conversion Confirmation Modal state
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

  // Open conversion modal with prefilled data
  const handleOpenConversionModal = (srv: FieldSurvey, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setConvertingSurvey(srv);
    setConvertedNama(srv.namaKegiatan);
    setConvertedKategori(srv.kategori || "Jalan Lingkungan");
    setConvertedPagu(srv.estimasiBiaya || 0);
    setConvertedTarget(srv.luasVolume || srv.panjang || 1);
    setConvertedSatuan(
      srv.satuan ||
        (srv.kategori === "Drainase/TPT"
          ? "Meter lari (m')"
          : "Meter persegi (m²)")
    );
    setConvertedKecamatan(srv.kecamatan);
    setConvertedDesa(srv.desaKelurahan);
    setConvertedDetailLokasi(srv.detailLokasi);
  };

  // Confirm conversion to Master Activity
  const handleConfirmConversion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingSurvey) return;

    onCreateProgramFromSurvey(convertingSurvey, {
      nama: convertedNama.trim() || convertingSurvey.namaKegiatan,
      namaKegiatan: convertedNama.trim() || convertingSurvey.namaKegiatan,
      kategori: convertedKategori,
      pagu: typeof convertedPagu === "number" ? convertedPagu : 0,
      target: typeof convertedTarget === "number" ? convertedTarget : 1,
      targetVolume: typeof convertedTarget === "number" ? convertedTarget : 1,
      satuan: convertedSatuan,
      kecamatan: convertedKecamatan,
      desaKelurahan: convertedDesa,
      detailLokasi: convertedDetailLokasi,
      lokasi: [convertedDetailLokasi, convertedDesa, convertedKecamatan]
        .filter(Boolean)
        .join(", "),
    });

    setConvertingSurvey(null);
    setSelectedSurveyId(null);
  };

  // Helper to check if survey is already converted to a program
  const getConnectedProgram = (srv: FieldSurvey): Program | undefined => {
    if (!srv.programId) return undefined;
    return programs.find((p) => p.id === srv.programId);
  };

  // Active survey for dedicated detail page
  const detailSurvey = selectedSurveyId
    ? surveys.find((s) => s.id === selectedSurveyId)
    : null;

  // Filtering surveys for list view
  const filteredSurveys = surveys.filter((s) => {
    const connected = getConnectedProgram(s);
    const isConverted = !!connected || s.status === "Diverifikasi";

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

  // Metrics
  const totalSurveys = surveys.length;
  const unconvertedCount = surveys.filter(
    (s) => !getConnectedProgram(s) && s.status !== "Diverifikasi"
  ).length;
  const convertedCount = surveys.filter(
    (s) => !!getConnectedProgram(s) || s.status === "Diverifikasi"
  ).length;
  const totalEstimasiUnconverted = surveys
    .filter((s) => !getConnectedProgram(s) && s.status !== "Diverifikasi")
    .reduce((acc, curr) => acc + (curr.estimasiBiaya || 0), 0);

  // =========================================================================
  // RENDER DEDICATED DETAIL PAGE IF A SURVEY IS SELECTED
  // =========================================================================
  if (detailSurvey) {
    const connectedProgram = getConnectedProgram(detailSurvey);
    const isConverted = !!connectedProgram || detailSurvey.status === "Diverifikasi";

    const badgeKondisi =
      detailSurvey.kondisi === "Baik"
        ? "bg-[#E7F6ED] text-[#258050] border-[#C8E8D5]"
        : detailSurvey.kondisi === "Rusak Ringan"
        ? "bg-[#FEF7E9] text-[#B07300] border-[#FCE6BD]"
        : detailSurvey.kondisi === "Rusak Sedang"
        ? "bg-[#FFF3E8] text-[#BD6C1E] border-[#FCDDC0]"
        : "bg-[#FDEEED] text-[#BD493B] border-[#F8C8C4]";

    return (
      <div className="space-y-6">
        {/* Navigation Bar / Top Breadcrumb */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <button
            onClick={() => setSelectedSurveyId(null)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#E8F2F8] text-[#1E4E8C] hover:bg-[#D8EAF5] transition"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Hasil Survey
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white text-[#1E4E8C] border border-[#C5DCEB] hover:bg-[#E8F2F8] transition shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" /> Cetak Lembar Survey
            </button>
          </div>
        </div>

        {/* Status Alert Banner */}
        {isConverted ? (
          <div className="p-4 rounded-2xl bg-[#E7F6ED] border border-[#C8E8D5] shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#258050] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-[#258050]">
                    Hasil Survey Ini Telah Dikonversi Menjadi Master Kegiatan Resmi
                  </h4>
                  <p className="text-xs text-[#2F6746] mt-0.5">
                    Data survey ini telah terintegrasi dalam database kegiatan dinas.
                    {connectedProgram && (
                      <>
                        {" "}
                        Kode: <strong>{connectedProgram.kode}</strong> —{" "}
                        {connectedProgram.nama} (Pagu:{" "}
                        <strong>{currency(connectedProgram.pagu)}</strong>)
                      </>
                    )}
                  </p>
                </div>
              </div>
              <span className="badge selesai text-xs font-bold shrink-0">
                Terdaftar di Master
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#FFF7EE] border border-[#FCDDC0] shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#E78A31] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-[#BD6C1E]">
                    Hasil Survey Lapangan Menunggu Konversi
                  </h4>
                  <p className="text-xs text-[#7A4B1A] mt-0.5">
                    Usulan survey ini siap dijadikan kegiatan resmi di Master Kegiatan
                    dengan data teknis, estimasi pagu, dan lokasi yang telah terdata.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleOpenConversionModal(detailSurvey)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1E4E8C] text-white hover:bg-[#143965] shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <FolderPlus className="w-4 h-4" />
                Buat Kegiatan Baru
              </button>
            </div>
          </div>
        )}

        {/* Main Details Panel */}
        <section className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E1E9F0] shadow-xs space-y-6">
          {/* Header Info */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-4 pb-6 border-b border-[#EAF0F4]">
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#143965] bg-[#F1F5F9] px-2.5 py-1 rounded-md">
                  {detailSurvey.kodeSurvey}
                </span>

                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[#EDF5FB] text-[#1E4E8C] border border-[#D0E3F0]">
                  {detailSurvey.kategori}
                </span>

                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-md border ${badgeKondisi}`}
                >
                  Kondisi: {detailSurvey.kondisi}
                </span>

                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-md ${
                    detailSurvey.tingkatUrgensi === "Tinggi / Mendesak"
                      ? "bg-[#FDEEED] text-[#BD493B]"
                      : detailSurvey.tingkatUrgensi === "Sedang"
                      ? "bg-[#FFF3E8] text-[#BD6C1E]"
                      : "bg-[#E7F6ED] text-[#258050]"
                  }`}
                >
                  Urgensi: {detailSurvey.tingkatUrgensi}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-[#143965] leading-tight">
                {detailSurvey.namaKegiatan}
              </h2>

              <p className="text-xs sm:text-sm text-[#65778B] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#BD493B] shrink-0" />
                <span>
                  {detailSurvey.detailLokasi ? `${detailSurvey.detailLokasi}, ` : ""}
                  Desa {detailSurvey.desaKelurahan}, Kecamatan{" "}
                  {detailSurvey.kecamatan}
                </span>
              </p>
            </div>

            {/* Quick Metrics Widget Box */}
            <div className="bg-[#F8FAFC] border border-[#E1E9F0] p-4 rounded-xl text-xs min-w-[240px] space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[#65778B]">Tanggal Survey:</span>
                <strong className="text-[#143965]">{detailSurvey.tanggal}</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#65778B]">Petugas Surveyor:</span>
                <strong className="text-[#1E4E8C]">{detailSurvey.surveyor}</strong>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#EAF0F4]">
                <span className="text-[#65778B]">Estimasi Biaya:</span>
                <strong className="text-sm font-bold text-[#148B87]">
                  {detailSurvey.estimasiBiaya
                    ? currency(detailSurvey.estimasiBiaya)
                    : "—"}
                </strong>
              </div>
            </div>
          </div>

          {/* 4 Technical Parameter Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-[#E1E9F0] bg-[#FAFBFD]">
              <span className="text-[11px] text-[#65778B] uppercase font-bold block">
                Kondisi Fisik
              </span>
              <strong className="text-sm text-[#BD493B] block mt-1">
                {detailSurvey.kondisi}
              </strong>
            </div>

            <div className="p-4 rounded-xl border border-[#E1E9F0] bg-[#FAFBFD]">
              <span className="text-[11px] text-[#65778B] uppercase font-bold block">
                Tipe Konstruksi
              </span>
              <strong className="text-sm text-[#143965] block mt-1 truncate">
                {detailSurvey.tipeKonstruksi || "Rabat Beton K-250"}
              </strong>
            </div>

            <div className="p-4 rounded-xl border border-[#E1E9F0] bg-[#FAFBFD]">
              <span className="text-[11px] text-[#65778B] uppercase font-bold block">
                Dimensi Lapangan
              </span>
              <strong className="text-sm text-[#143965] block mt-1">
                {detailSurvey.panjang
                  ? `${detailSurvey.panjang}m × ${detailSurvey.lebar || 0}m`
                  : "—"}
              </strong>
            </div>

            <div className="p-4 rounded-xl border border-[#E1E9F0] bg-[#FAFBFD]">
              <span className="text-[11px] text-[#65778B] uppercase font-bold block">
                Volume / Luas
              </span>
              <strong className="text-sm text-[#148B87] block mt-1">
                {detailSurvey.luasVolume
                  ? `${detailSurvey.luasVolume} ${detailSurvey.satuan || "m²"}`
                  : "—"}
              </strong>
            </div>
          </div>

          {/* Informasi Geografis & Titik Koordinat GPS */}
          <div className="p-4 rounded-2xl bg-[#F6F9FB] border border-[#E1E9F0] space-y-3">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#1E4E8C]" />
              <h4 className="text-xs font-bold text-[#143965] uppercase tracking-wider">
                Lokasi Geografis & Titik Koordinat Lapangan
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[#65778B] block">Kecamatan:</span>
                <strong className="text-[#143965] block mt-0.5">
                  {detailSurvey.kecamatan}
                </strong>
              </div>
              <div>
                <span className="text-[#65778B] block">Desa / Kelurahan:</span>
                <strong className="text-[#143965] block mt-0.5">
                  {detailSurvey.desaKelurahan}
                </strong>
              </div>
              <div>
                <span className="text-[#65778B] block">Detail Ruas / Blok:</span>
                <strong className="text-[#143965] block mt-0.5">
                  {detailSurvey.detailLokasi || "Ruas Permukiman Warga"}
                </strong>
              </div>
            </div>

            {detailSurvey.kontakPendamping && (
              <p className="text-xs text-[#65778B] pt-2 border-t border-[#EAF0F4]">
                Tokoh / Pendamping Lapangan:{" "}
                <strong className="text-[#143965]">
                  {detailSurvey.kontakPendamping}
                </strong>
              </p>
            )}

            {detailSurvey.koordinat && (
              <div className="flex items-center justify-between pt-2 border-t border-[#EAF0F4]">
                <span className="font-mono text-xs text-[#143965]">
                  Titik Koordinat GPS: {detailSurvey.koordinat}
                </span>
                <a
                  href={`https://www.google.com/maps?q=${detailSurvey.koordinat}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-[#1E4E8C] hover:underline flex items-center gap-1"
                >
                  Buka di Google Maps <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Uraian Temuan Kerusakan & Rekomendasi Teknis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#FFFBF7] border border-[#FAD8B8] space-y-2">
              <strong className="block text-xs font-bold text-[#9C5311] uppercase tracking-wider">
                Uraian Temuan Kerusakan Fisik Lapangan
              </strong>
              <p className="text-xs text-[#4E3218] leading-relaxed">
                {detailSurvey.uraianTemuan}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F4F9FD] border border-[#CFE1EE] space-y-2">
              <strong className="block text-xs font-bold text-[#1E4E8C] uppercase tracking-wider">
                Rekomendasi Penanganan Teknis
              </strong>
              <p className="text-xs text-[#173859] leading-relaxed">
                {detailSurvey.rekomendasi ||
                  "Belum ada rekomendasi penanganan teknis tercatat."}
              </p>
            </div>
          </div>

          {/* Foto Dokumentasi Fisik 0% Lapangan */}
          {detailSurvey.fotoUrl && (
            <div className="space-y-2 pt-2 border-t border-[#EAF0F4]">
              <strong className="block text-xs font-bold text-[#35536F] uppercase tracking-wider">
                Dokumentasi Fisik Lapangan (Kondisi Titik 0%)
              </strong>
              <div className="rounded-2xl overflow-hidden border border-[#DCE5ED] aspect-video max-h-96 bg-black/5 shadow-xs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={detailSurvey.fotoUrl}
                  alt="Dokumentasi Survey Lapangan"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Bottom Action Footer */}
          <div className="pt-6 border-t border-[#EAF0F4] flex flex-col sm:flex-row justify-between items-center gap-3">
            <button
              onClick={() => setSelectedSurveyId(null)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-[#E8F2F8] text-[#1E4E8C] hover:bg-[#D8EAF5] transition flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Hasil Survey
            </button>
          </div>
        </section>

        {/* Modal Konversi (if opened from detail page) */}
        {convertingSurvey && (
          <div className="fixed inset-0 z-50 bg-[#0B2540]/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#DCE5ED]">
              <div className="flex items-center justify-between p-6 border-b border-[#EAF0F4]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#E8F2F8] text-[#1E4E8C] flex items-center justify-center">
                    <FolderPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#143965]">
                      Buat Master Kegiatan dari Survey
                    </h3>
                    <p className="text-xs text-[#65778B]">
                      Sumber: {convertingSurvey.kodeSurvey} (
                      {convertingSurvey.surveyor})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setConvertingSurvey(null)}
                  className="p-1.5 rounded-lg text-[#65778B] hover:text-[#143965] hover:bg-[#F4F7FA] transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleConfirmConversion} className="p-6 space-y-4">
                <div className="p-3.5 rounded-xl bg-[#F0F7FD] border border-[#CDE1F3] text-xs text-[#1E4E8C] flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Data teknis, lokasi, dan estimasi biaya dari hasil survey telah
                    diisikan secara otomatis ke Master Kegiatan.
                  </span>
                </div>

                {/* Kategori Kegiatan */}
                <div>
                  <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                    Kategori Kegiatan *
                  </label>
                  <select
                    value={convertedKategori}
                    onChange={(e) => setConvertedKategori(e.target.value)}
                    className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white font-semibold"
                    required
                  >
                    <option value="Jalan Lingkungan">Jalan Lingkungan</option>
                    <option value="Drainase/TPT">Drainase/TPT</option>
                    <option value="Konstruksi Lainnya">Konstruksi Lainnya</option>
                    <option value="Air Bersih">Air Bersih</option>
                    <option value="Penataan Kawasan">Penataan Kawasan</option>
                  </select>
                </div>

                {/* Nama Kegiatan */}
                <div>
                  <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                    Nama Master Kegiatan *
                  </label>
                  <input
                    type="text"
                    value={convertedNama}
                    onChange={(e) => setConvertedNama(e.target.value)}
                    required
                    className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white font-medium"
                  />
                </div>

                {/* Lokasi Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                      Kecamatan
                    </label>
                    <input
                      type="text"
                      value={convertedKecamatan}
                      onChange={(e) => setConvertedKecamatan(e.target.value)}
                      className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                      Desa / Kelurahan
                    </label>
                    <input
                      type="text"
                      value={convertedDesa}
                      onChange={(e) => setConvertedDesa(e.target.value)}
                      className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                    Detail Lokasi / Ruas Jalan
                  </label>
                  <input
                    type="text"
                    value={convertedDetailLokasi}
                    onChange={(e) => setConvertedDetailLokasi(e.target.value)}
                    className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>

                {/* Pagu Anggaran */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                      Pagu Anggaran Kegiatan (Rp) *
                    </label>
                    <input
                      type="number"
                      value={convertedPagu}
                      onChange={(e) =>
                        setConvertedPagu(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      placeholder="Contoh: 150000000"
                      className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white font-mono"
                      required
                    />
                    {typeof convertedPagu === "number" && convertedPagu > 0 && (
                      <span className="text-[11px] text-[#148B87] font-semibold mt-0.5 block">
                        {currency(convertedPagu)}
                      </span>
                    )}
                  </div>

                  {/* Target Volume & Satuan */}
                  <div>
                    <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                      Target Volume & Satuan
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.01"
                        value={convertedTarget}
                        onChange={(e) =>
                          setConvertedTarget(
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        className="w-1/2 border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white font-mono"
                      />
                      <select
                        value={convertedSatuan}
                        onChange={(e) => setConvertedSatuan(e.target.value)}
                        className="w-1/2 border border-[#CCD9E4] rounded-xl px-2 py-2 text-xs bg-white"
                      >
                        <option value="Meter persegi (m²)">m²</option>
                        <option value="Meter lari (m')">m'</option>
                        <option value="Meter kubik (m³)">m³</option>
                        <option value="Unit">Unit</option>
                        <option value="Kilometer (KM)">KM</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#EAF0F4] flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setConvertingSurvey(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#65778B] hover:text-[#143965] border border-[#CCD9E4]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#1E4E8C] text-white hover:bg-[#143965] shadow-xs flex items-center gap-1.5 transition"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Simpan & Masukkan ke Master Kegiatan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // RENDER MAIN LIST VIEW
  // =========================================================================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#1E4E8C] text-white flex items-center justify-center shadow-xs">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#143965]">
                Hasil Survey Lapangan Operator
              </h2>
              <p className="text-xs sm:text-sm text-[#65778B] mt-0.5">
                Tinjau pendataan riil lapangan dari operator dan konversi langsung
                menjadi kegiatan resmi di Master Kegiatan
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <article className="bg-white rounded-2xl p-5 border border-[#E1E9F0] shadow-xs card-indicator">
          <p className="text-xs font-semibold text-[#65778B] m-0">
            Total Survey Masuk
          </p>
          <strong className="block text-2xl font-bold text-[#143965] mt-1.5">
            {totalSurveys}
          </strong>
          <span className="text-[11px] text-[#65778B] block mt-1">
            Dari seluruh operator dinas
          </span>
        </article>

        <article className="bg-white rounded-2xl p-5 border border-[#E1E9F0] shadow-xs card-indicator orange">
          <p className="text-xs font-semibold text-[#65778B] m-0">
            Belum Jadi Kegiatan
          </p>
          <strong className="block text-2xl font-bold text-[#E78A31] mt-1.5">
            {unconvertedCount} Usulan
          </strong>
          <span className="text-[11px] text-[#65778B] block mt-1">
            Menunggu konversi ke Master
          </span>
        </article>

        <article className="bg-white rounded-2xl p-5 border border-[#E1E9F0] shadow-xs card-indicator green">
          <p className="text-xs font-semibold text-[#65778B] m-0">
            Sudah Jadi Master Kegiatan
          </p>
          <strong className="block text-2xl font-bold text-[#258050] mt-1.5">
            {convertedCount} Kegiatan
          </strong>
          <span className="text-[11px] text-[#65778B] block mt-1">
            Telah diagendakan di dinas
          </span>
        </article>

        <article className="bg-white rounded-2xl p-5 border border-[#E1E9F0] shadow-xs card-indicator teal">
          <p className="text-xs font-semibold text-[#65778B] m-0">
            Estimasi Usulan Menunggu
          </p>
          <strong className="block text-xl font-bold text-[#148B87] mt-1.5 truncate">
            {currency(totalEstimasiUnconverted)}
          </strong>
          <span className="text-[11px] text-[#65778B] block mt-1">
            Total biaya usulan baru
          </span>
        </article>
      </div>

      {/* Main List Section */}
      <section className="bg-white rounded-2xl border border-[#E1E9F0] shadow-xs overflow-hidden">
        {/* Filter Bar */}
        <div className="p-5 border-b border-[#EAF0F4] space-y-3.5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-base font-bold text-[#143965]">
                Daftar Hasil Survey Lapangan
              </h3>
              <p className="text-xs text-[#65778B] mt-0.5">
                Klik tombol <strong>Cek Detail Lengkap</strong> untuk membuka halaman
                detail hasil survey
              </p>
            </div>

            {/* Quick Status Pill Filter */}
            <div className="flex items-center gap-1.5 bg-[#F4F7FA] p-1 rounded-xl border border-[#CCD9E4] text-xs font-bold">
              <button
                onClick={() => setFilterStatusKonversi("all")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterStatusKonversi === "all"
                    ? "bg-[#1E4E8C] text-white shadow-xs"
                    : "text-[#65778B] hover:text-[#143965]"
                }`}
              >
                Semua ({totalSurveys})
              </button>
              <button
                onClick={() => setFilterStatusKonversi("unconverted")}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                  filterStatusKonversi === "unconverted"
                    ? "bg-[#E78A31] text-white shadow-xs"
                    : "text-[#65778B] hover:text-[#143965]"
                }`}
              >
                Belum Jadi Kegiatan ({unconvertedCount})
              </button>
              <button
                onClick={() => setFilterStatusKonversi("converted")}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterStatusKonversi === "converted"
                    ? "bg-[#258050] text-white shadow-xs"
                    : "text-[#65778B] hover:text-[#143965]"
                }`}
              >
                Sudah Jadi Kegiatan ({convertedCount})
              </button>
            </div>
          </div>

          {/* Search and Dropdown Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#8AA2B5] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari kegiatan, desa, surveyor, kode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-[#CCD9E4] rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1E4E8C]/20"
              />
            </div>

            {/* Kategori Kegiatan Filter */}
            <div>
              <select
                value={filterKategori}
                onChange={(e) => setFilterKategori(e.target.value)}
                className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-xs bg-white text-[#35536F] font-semibold"
              >
                <option value="">Semua Kategori Kegiatan</option>
                <option value="Jalan Lingkungan">Jalan Lingkungan</option>
                <option value="Drainase/TPT">Drainase/TPT</option>
                <option value="Konstruksi Lainnya">Konstruksi Lainnya</option>
              </select>
            </div>

            {/* Urgensi Filter */}
            <div>
              <select
                value={filterUrgensi}
                onChange={(e) => setFilterUrgensi(e.target.value)}
                className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-xs bg-white text-[#35536F]"
              >
                <option value="">Semua Tingkat Urgensi</option>
                <option value="Tinggi / Mendesak">Tinggi / Mendesak</option>
                <option value="Sedang">Sedang</option>
                <option value="Rendah">Rendah</option>
              </select>
            </div>

            {/* Kecamatan Filter */}
            <div>
              <select
                value={filterKecamatan}
                onChange={(e) => setFilterKecamatan(e.target.value)}
                className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-xs bg-white text-[#35536F]"
              >
                <option value="">Semua Kecamatan</option>
                {defaultKecamatanList.map((k) => (
                  <option key={k} value={k}>
                    Kecamatan {k}
                  </option>
                ))}
                <option value="Kuningan">Kecamatan Kuningan</option>
                <option value="Cilimus">Kecamatan Cilimus</option>
              </select>
            </div>
          </div>
        </div>

        {/* LIST HASIL SURVEY */}
        <div className="p-5 sm:p-6 space-y-3.5 bg-[#FAFBFD]">
          {filteredSurveys.length > 0 ? (
            filteredSurveys.map((srv) => {
              const connectedProgram = getConnectedProgram(srv);
              const isConverted = !!connectedProgram || srv.status === "Diverifikasi";

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
                  onClick={() => setSelectedSurveyId(srv.id)}
                  className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md hover:border-[#1E4E8C]/40 ${
                    !isConverted
                      ? "border-l-4 border-l-[#E78A31] border-[#E1E9F0]"
                      : "border-l-4 border-l-[#258050] border-[#E1E9F0]"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    {/* Left Details */}
                    <div className="space-y-2 flex-1 min-w-0">
                      {/* Meta Tags Row */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Status Konversi Badge */}
                        {isConverted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E7F6ED] text-[#258050] border border-[#C8E8D5]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Sudah Jadi Kegiatan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFF3E8] text-[#BD6C1E] border border-[#FCDDC0]">
                            <Sparkles className="w-3.5 h-3.5" />
                            Belum Jadi Kegiatan
                          </span>
                        )}

                        <span className="font-mono text-xs font-bold text-[#143965] bg-[#F1F5F9] px-2 py-0.5 rounded-md">
                          {srv.kodeSurvey}
                        </span>

                        <span className="text-xs text-[#65778B] flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {srv.tanggal}
                        </span>

                        <span className="text-xs text-[#1E4E8C] font-semibold flex items-center gap-1 bg-[#E8F2F8] px-2 py-0.5 rounded-md">
                          <UserIcon className="w-3.5 h-3.5" />
                          Surveyor: {srv.surveyor}
                        </span>

                        {/* Kategori badge */}
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#EDF5FB] text-[#1E4E8C] border border-[#D0E3F0]">
                          {srv.kategori}
                        </span>

                        {/* Kondisi badge */}
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-md border ${badgeKondisi}`}
                        >
                          {srv.kondisi}
                        </span>
                      </div>

                      {/* Title & Location */}
                      <div>
                        <h4 className="text-base sm:text-lg font-bold text-[#143965] leading-snug hover:text-[#1E4E8C] transition">
                          {srv.namaKegiatan}
                        </h4>
                        <p className="text-xs text-[#65778B] flex items-center gap-1.5 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-[#BD493B] shrink-0" />
                          <span>
                            {srv.detailLokasi ? `${srv.detailLokasi}, ` : ""}
                            Desa {srv.desaKelurahan}, Kec. {srv.kecamatan}
                          </span>
                          {srv.koordinat && (
                            <span className="font-mono text-[11px] text-[#1E4E8C] bg-[#E8F2F8] px-1.5 py-0.2 rounded">
                              GPS: {srv.koordinat}
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Brief findings summary */}
                      <p className="text-xs text-[#496178] line-clamp-1 italic bg-[#F8FAFC] p-2 rounded-lg border border-[#EAF0F4]">
                        &ldquo;{srv.uraianTemuan}&rdquo;
                      </p>
                    </div>

                    {/* Right Metrics & Action Buttons */}
                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto pt-3 lg:pt-0 border-t lg:border-t-0 border-[#EAF0F4] gap-3 shrink-0">
                      <div className="text-left lg:text-right">
                        <span className="text-[11px] text-[#65778B] uppercase font-bold block">
                          Estimasi Biaya Usulan
                        </span>
                        <strong className="text-base sm:text-lg font-bold text-[#148B87] block">
                          {srv.estimasiBiaya ? currency(srv.estimasiBiaya) : "—"}
                        </strong>
                        <span className="text-[11px] text-[#65778B]">
                          Volume:{" "}
                          <strong>
                            {srv.luasVolume
                              ? `${srv.luasVolume} ${srv.satuan || "m²"}`
                              : srv.panjang
                              ? `${srv.panjang} meter`
                              : "—"}
                          </strong>
                        </span>
                      </div>

                      {/* Action buttons with requested name "Cek Detail Lengkap" */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSurveyId(srv.id);
                          }}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#E8F2F8] text-[#1E4E8C] hover:bg-[#D5E6F3] border border-[#CCDCE8] transition flex items-center gap-1.5 shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5" /> Cek Detail Lengkap
                        </button>

                        {!isConverted && (
                          <button
                            type="button"
                            onClick={(e) => handleOpenConversionModal(srv, e)}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1E4E8C] text-white hover:bg-[#143965] shadow-xs transition flex items-center gap-1.5"
                          >
                            <FolderPlus className="w-3.5 h-3.5" />
                            Buat Kegiatan Baru
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#CCD9E4] text-[#65778B] p-6">
              <ClipboardCheck className="w-12 h-12 mx-auto text-[#9BB1C2] mb-3" />
              <h4 className="font-bold text-base text-[#143965]">
                Tidak ada hasil survey yang sesuai filter
              </h4>
              <p className="text-xs text-[#65778B] mt-1 max-w-md mx-auto">
                Coba sesuaikan kata kunci pencarian, ubah filter kategori, atau reset
                filter status.
              </p>
              {(searchTerm ||
                filterKategori ||
                filterStatusKonversi !== "all" ||
                filterUrgensi ||
                filterKecamatan) && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterKategori("");
                    setFilterStatusKonversi("all");
                    setFilterUrgensi("");
                    setFilterKecamatan("");
                  }}
                  className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#E8F2F8] text-[#1E4E8C] hover:bg-[#D5E6F3]"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Semua Filter
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Modal Konversi (if opened from list view) */}
      {convertingSurvey && (
        <div className="fixed inset-0 z-50 bg-[#0B2540]/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#DCE5ED]">
            <div className="flex items-center justify-between p-6 border-b border-[#EAF0F4]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#E8F2F8] text-[#1E4E8C] flex items-center justify-center">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#143965]">
                    Buat Master Kegiatan dari Survey
                  </h3>
                  <p className="text-xs text-[#65778B]">
                    Sumber: {convertingSurvey.kodeSurvey} ({convertingSurvey.surveyor})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConvertingSurvey(null)}
                className="p-1.5 rounded-lg text-[#65778B] hover:text-[#143965] hover:bg-[#F4F7FA] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmConversion} className="p-6 space-y-4">
              <div className="p-3.5 rounded-xl bg-[#F0F7FD] border border-[#CDE1F3] text-xs text-[#1E4E8C] flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Data teknis, lokasi, dan estimasi biaya dari hasil survey telah
                  diisikan secara otomatis. Anda dapat meninjau dan menyesuaikan sebelum
                  disimpan ke Master Kegiatan.
                </span>
              </div>

              {/* Kategori Kegiatan */}
              <div>
                <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                  Kategori Kegiatan *
                </label>
                <select
                  value={convertedKategori}
                  onChange={(e) => setConvertedKategori(e.target.value)}
                  className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white font-semibold"
                  required
                >
                  <option value="Jalan Lingkungan">Jalan Lingkungan</option>
                  <option value="Drainase/TPT">Drainase/TPT</option>
                  <option value="Konstruksi Lainnya">Konstruksi Lainnya</option>
                  <option value="Air Bersih">Air Bersih</option>
                  <option value="Penataan Kawasan">Penataan Kawasan</option>
                </select>
              </div>

              {/* Nama Kegiatan */}
              <div>
                <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                  Nama Master Kegiatan *
                </label>
                <input
                  type="text"
                  value={convertedNama}
                  onChange={(e) => setConvertedNama(e.target.value)}
                  required
                  className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white font-medium"
                />
              </div>

              {/* Lokasi Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                    Kecamatan
                  </label>
                  <input
                    type="text"
                    value={convertedKecamatan}
                    onChange={(e) => setConvertedKecamatan(e.target.value)}
                    className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                    Desa / Kelurahan
                  </label>
                  <input
                    type="text"
                    value={convertedDesa}
                    onChange={(e) => setConvertedDesa(e.target.value)}
                    className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                  Detail Lokasi / Ruas Jalan
                </label>
                <input
                  type="text"
                  value={convertedDetailLokasi}
                  onChange={(e) => setConvertedDetailLokasi(e.target.value)}
                  className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
                />
              </div>

              {/* Pagu Anggaran */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                    Pagu Anggaran Kegiatan (Rp) *
                  </label>
                  <input
                    type="number"
                    value={convertedPagu}
                    onChange={(e) =>
                      setConvertedPagu(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    placeholder="Contoh: 150000000"
                    className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white font-mono"
                    required
                  />
                  {typeof convertedPagu === "number" && convertedPagu > 0 && (
                    <span className="text-[11px] text-[#148B87] font-semibold mt-0.5 block">
                      {currency(convertedPagu)}
                    </span>
                  )}
                </div>

                {/* Target Volume & Satuan */}
                <div>
                  <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                    Target Volume & Satuan
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={convertedTarget}
                      onChange={(e) =>
                        setConvertedTarget(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      className="w-1/2 border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white font-mono"
                    />
                    <select
                      value={convertedSatuan}
                      onChange={(e) => setConvertedSatuan(e.target.value)}
                      className="w-1/2 border border-[#CCD9E4] rounded-xl px-2 py-2 text-xs bg-white"
                    >
                      <option value="Meter persegi (m²)">m²</option>
                      <option value="Meter lari (m')">m'</option>
                      <option value="Meter kubik (m³)">m³</option>
                      <option value="Unit">Unit</option>
                      <option value="Kilometer (KM)">KM</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#F8FAFC] border border-[#EAF0F4] rounded-xl text-xs text-[#65778B]">
                <p>
                  <strong>Penanggung Jawab / Operator Pengelola:</strong>{" "}
                  {convertingSurvey.surveyor}
                </p>
                <p className="mt-0.5">
                  <strong>Kondisi Fisik Terdata:</strong> {convertingSurvey.kondisi}
                </p>
              </div>

              <div className="pt-4 border-t border-[#EAF0F4] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setConvertingSurvey(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#65778B] hover:text-[#143965] border border-[#CCD9E4]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#1E4E8C] text-white hover:bg-[#143965] shadow-xs flex items-center gap-1.5 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Simpan & Masukkan ke Master Kegiatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
