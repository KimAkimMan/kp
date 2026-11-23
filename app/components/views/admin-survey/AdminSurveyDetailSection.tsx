"use client";

import React from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  FolderPlus,
  Printer,
  RotateCcw,
  Sparkles,
  X,
  MapPin,
  Compass,
} from "lucide-react";
import { FieldSurvey, Program } from "../../../types";
import { currency } from "../../../utils/helpers";

interface AdminSurveyDetailSectionProps {
  detailSurvey: FieldSurvey | null;
  connectedProgram: Program | undefined;
  isConverted: boolean;
  isVerified: boolean;
  onClose: () => void;
  onVerifySurvey: (survey: FieldSurvey, reason?: string) => void;
  onRejectSurvey: (survey: FieldSurvey, reason?: string) => void;
  onRequestRevision: (survey: FieldSurvey, reason?: string) => void;
  onOpenConversionModal: (srv: FieldSurvey) => void;
}

const badgeKondisi = (kondisi: string) =>
  kondisi === "Baik"
    ? "bg-[#E7F6ED] text-[#258050] border-[#C8E8D5]"
    : kondisi === "Rusak Ringan"
    ? "bg-[#FEF7E9] text-[#B07300] border-[#FCE6BD]"
    : kondisi === "Rusak Sedang"
    ? "bg-[#FFF3E8] text-[#BD6C1E] border-[#FCDDC0]"
    : "bg-[#FDEEED] text-[#BD493B] border-[#F8C8C4]";

const kondisiClass = (tingkatUrgensi: string) =>
  tingkatUrgensi === "Tinggi / Mendesak"
    ? "bg-[#FDEEED] text-[#BD493B]"
    : tingkatUrgensi === "Sedang"
    ? "bg-[#FFF3E8] text-[#BD6C1E]"
    : "bg-[#E7F6ED] text-[#258050]";

export function AdminSurveyDetailSection({
  detailSurvey,
  connectedProgram,
  isConverted,
  isVerified,
  onClose,
  onVerifySurvey,
  onRejectSurvey,
  onRequestRevision,
  onOpenConversionModal,
}: AdminSurveyDetailSectionProps) {
  if (!detailSurvey) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <button
          onClick={onClose}
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
                  {isVerified
                    ? "Hasil Survey Siap Dikonversi"
                    : "Hasil Survey Menunggu Verifikasi"}
                </h4>
                <p className="text-xs text-[#7A4B1A] mt-0.5">
                  {isVerified
                    ? "Survey telah diverifikasi dan dapat dijadikan kegiatan resmi."
                    : "Survey harus diverifikasi Admin sebelum dapat dikonversi menjadi kegiatan."}
                </p>
              </div>
            </div>
            {isVerified ? (
              <button
                type="button"
                onClick={() => onOpenConversionModal(detailSurvey)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1E4E8C] text-white hover:bg-[#143965] shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <FolderPlus className="w-4 h-4" />
                Buat Kegiatan Baru
              </button>
            ) : detailSurvey.status === "Menunggu Verifikasi" ? (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const reason = window.prompt(
                      "Masukkan alasan verifikasi (opsional):"
                    );
                    void onVerifySurvey(detailSurvey, reason ?? undefined);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#258050] text-white hover:bg-[#1D6840] shadow-xs flex items-center gap-1.5 shrink-0"
                >
                  <FileCheck2 className="w-4 h-4" />
                  Verifikasi
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const reason = window.prompt("Alasan penolakan (wajib diisi):");
                    if (reason && reason.trim()) {
                      void onRejectSurvey(detailSurvey, reason.trim());
                    } else {
                      window.alert("Alasan penolakan wajib diisi.");
                    }
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#BD493B] text-white hover:bg-[#9B2C2C] shadow-xs flex items-center gap-1.5 shrink-0"
                >
                  <X className="w-4 h-4" />
                  Tolak
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const reason = window.prompt(
                      "Alasan permintaan revisi (wajib diisi):"
                    );
                    if (reason && reason.trim()) {
                      void onRequestRevision(detailSurvey, reason.trim());
                    } else {
                      window.alert("Alasan revisi wajib diisi.");
                    }
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#D97706] text-white hover:bg-[#B45309] shadow-xs flex items-center gap-1.5 shrink-0"
                >
                  <RotateCcw className="w-4 h-4" />
                  Minta Revisi
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => void onVerifySurvey(detailSurvey)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#258050] text-white hover:bg-[#1D6840] shadow-xs flex items-center gap-1.5 shrink-0"
              >
                <FileCheck2 className="w-4 h-4" />
                Verifikasi Survey
              </button>
            )}
          </div>
        </div>
      )}

      <section className="bg-white rounded-2xl p-6 sm:p-7 border border-[#E1E9F0] shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-4 pb-6 border-b border-[#EAF0F4]">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#143965] bg-[#F1F5F9] px-2.5 py-1 rounded-md">
                {detailSurvey.kodeSurvey}
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-[#EDF5FB] text-[#1E4E8C] border border-[#D0E3F0]">
                {detailSurvey.kategori}
              </span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${badgeKondisi(detailSurvey.kondisi)}`}>
                Kondisi: {detailSurvey.kondisi}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${kondisiClass(detailSurvey.tingkatUrgensi)}`}>
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
              Tokoh / Pendamping Lapangan:{ " " }
              <strong className="text-[#143965]">{detailSurvey.kontakPendamping}</strong>
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

        {detailSurvey.fotoUrl && (
          <div className="space-y-2 pt-2 border-t border-[#EAF0F4]">
            <strong className="block text-xs font-bold text-[#35536F] uppercase tracking-wider">
              Dokumentasi Fisik Lapangan (Kondisi Titik 0%)
            </strong>
            <div className="rounded-2xl overflow-hidden border border-[#DCE5ED] aspect-video max-h-96 bg-black/5 shadow-xs">
              <img
                src={detailSurvey.fotoUrl}
                alt="Dokumentasi Survey Lapangan"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-[#EAF0F4] flex flex-col sm:flex-row justify-between items-center gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-[#E8F2F8] text-[#1E4E8C] hover:bg-[#D8EAF5] transition flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Hasil Survey
          </button>
        </div>
      </section>
    </div>
  );
}
