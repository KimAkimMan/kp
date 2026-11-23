"use client";

import React from "react";
import {
  Search,
  ClipboardCheck,
  Plus,
  Eye,
  Edit3,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { FieldSurvey } from "../../../types";
import { currency } from "../../../utils/helpers";
import { defaultKecamatanList } from "../../../data/initialData";
import { Select, Input } from "@/app/components/ui/Input";

interface AdminSurveyListSectionProps {
  surveys: FieldSurvey[];
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
  totalSurveys: number;
  unconvertedCount: number;
  convertedCount: number;
  totalEstimasiUnconverted: number;
  onViewSurvey: (srv: FieldSurvey) => void;
  onEditSurvey: (srv: FieldSurvey) => void;
  onDeleteSurvey: (id: string) => void;
  onAddSurvey: () => void;
}

const badgeKondisi = (kondisi: string) =>
  kondisi === "Baik"
    ? "bg-[#E7F6ED] text-[#258050] border-[#C8E8D5]"
    : kondisi === "Rusak Ringan"
    ? "bg-[#FEF7E9] text-[#B07300] border-[#FCE6BD]"
    : kondisi === "Rusak Sedang"
    ? "bg-[#FFF3E8] text-[#BD6C1E] border-[#FCDDC0]"
    : "bg-[#FDEEED] text-[#BD493B] border-[#F8C8C4]";

export function AdminSurveyListSection({
  surveys,
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
  totalSurveys,
  unconvertedCount,
  convertedCount,
  totalEstimasiUnconverted,
  onViewSurvey,
  onEditSurvey,
  onDeleteSurvey,
  onAddSurvey,
}: AdminSurveyListSectionProps) {
  const filteredSurveys = surveys.filter((s) => {
    const isConverted = s.status === "Dikonversi";

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

  const unconvertedCountCalc = filteredSurveys.filter(
    (s) => s.status !== "Dikonversi"
  ).length;
  const convertedCountCalc = filteredSurveys.filter(
    (s) => s.status === "Dikonversi"
  ).length;

  return (
    <section className="bg-white rounded-2xl border border-[#E1E9F0] shadow-xs overflow-hidden">
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

          <div className="flex items-center gap-1.5 bg-[#F4F7FA] p-1 rounded-xl border border-[#CCD9E4] text-xs font-bold">
            <button
              onClick={() => setFilterStatusKonversi("all")}
              className={`px-3 py-1.5 rounded-lg ${
                filterStatusKonversi === "all"
                  ? "bg-[#1E4E8C] text-white shadow-xs"
                  : "text-[#65778B] hover:text-[#143965]"
              }`}
            >
              Semua ({totalSurveys})
            </button>
            <button
              onClick={() => setFilterStatusKonversi("unconverted")}
              className={`px-3 py-1.5 rounded-lg ${
                filterStatusKonversi === "unconverted"
                  ? "bg-[#E78A31] text-white shadow-xs"
                  : "text-[#65778B] hover:text-[#143965]"
              }`}
            >
              Belum Jadi Kegiatan ({unconvertedCountCalc})
            </button>
            <button
              onClick={() => setFilterStatusKonversi("converted")}
              className={`px-3 py-1.5 rounded-lg ${
                filterStatusKonversi === "converted"
                  ? "bg-[#258050] text-white shadow-xs"
                  : "text-[#65778B] hover:text-[#143965]"
              }`}
            >
              Sudah Jadi Kegiatan ({convertedCountCalc})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8AA2B5] absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="Cari kegiatan, desa, surveyor, kode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1E4E8C]/20"
            />
          </div>

          <Select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-xs bg-white text-[#35536F] font-semibold"
          >
            <option value="">Semua Kategori Kegiatan</option>
            <option value="Jalan Lingkungan">Jalan Lingkungan</option>
            <option value="Drainase/TPT">Drainase/TPT</option>
            <option value="Konstruksi Lainnya">Konstruksi Lainnya</option>
          </Select>

          <Select
            value={filterUrgensi}
            onChange={(e) => setFilterUrgensi(e.target.value)}
            className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-xs bg-white text-[#35536F]"
          >
            <option value="">Semua Tingkat Urgensi</option>
            <option value="Tinggi / Mendesak">Tinggi / Mendesak</option>
            <option value="Sedang">Sedang</option>
            <option value="Rendah">Rendah</option>
          </Select>

          <Select
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
          </Select>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-3.5 bg-[#FAFBFD]">
        {filteredSurveys.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#61738A] uppercase font-bold text-[11px] border-b border-[#EAF0F4]">
                <tr>
                  <th className="p-3.5">Kode & Tanggal</th>
                  <th className="p-3.5">Nama Kegiatan / Lokasi</th>
                  <th className="p-3.5">Kondisi</th>
                  <th className="p-3.5">Dimensi</th>
                  <th className="p-3.5">Estimasi Biaya</th>
                  <th className="p-3.5">Urgensi</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAF0F4]">
                {filteredSurveys.map((srv) => {
                  const connectedProgram = undefined; // resolved by parent
                  const isConverted = srv.status === "Dikonversi";
                  const isVerified = srv.status === "Diverifikasi";

                  return (
                    <tr key={srv.id} className="hover:bg-[#F9FBFC] transition">
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-bold text-[#143965] block">
                          {srv.kodeSurvey}
                        </span>
                        <span className="text-[11px] text-[#65778B]">
                          {srv.tanggal}
                        </span>
                        <span className="block text-[10px] text-[#1E4E8C] font-semibold mt-0.5">
                          Oleh: {srv.surveyor}
                        </span>
                      </td>

                      <td className="p-3.5 min-w-[220px]">
                        <strong className="block text-[#143965] text-sm leading-snug">
                          {srv.namaKegiatan}
                        </strong>
                        <span className="text-[11px] text-[#65778B] block mt-0.5">
                          {srv.detailLokasi || `${srv.desaKelurahan}, Kec. ${srv.kecamatan}`}
                        </span>
                        <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-[#EAF0F4] text-[#1E4E8C]">
                          {srv.kategori}
                        </span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${badgeKondisi(srv.kondisi)}`}>
                          {srv.kondisi}
                        </span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap text-[#35536F]">
                        {srv.panjang ? (
                          <div>
                            <span>{srv.panjang} m</span>
                            {srv.lebar && <span className="text-[#8AA2B5]"> × {srv.lebar} m</span>}
                            {srv.luasVolume && (
                              <span className="block text-[11px] text-[#65778B]">({srv.luasVolume} {srv.satuan || "m²"})</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#8AA2B5]">—</span>
                        )}
                      </td>

                      <td className="p-3.5 whitespace-nowrap font-bold text-[#148B87]">
                        {srv.estimasiBiaya ? currency(srv.estimasiBiaya) : "—"}
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`font-semibold text-[11px] ${srv.tingkatUrgensi === "Tinggi / Mendesak" ? "text-[#BD493B]" : srv.tingkatUrgensi === "Sedang" ? "text-[#BD6C1E]" : "text-[#258050]"}`}>
                          {srv.tingkatUrgensi}
                        </span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <span className="badge selesai text-[11px] font-bold">
                          {srv.status}
                        </span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onViewSurvey(srv)}
                            title="Lihat Detail Survey"
                            className="p-1.5 rounded-lg text-[#1E4E8C] hover:bg-[#E8F2F8] transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditSurvey(srv)}
                            title="Edit Data Survey"
                            className="p-1.5 rounded-lg text-[#148B87] hover:bg-[#EAF6F5] transition"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteSurvey(srv.id)}
                            title="Hapus Data Survey"
                            className="p-1.5 rounded-lg text-[#BD493B] hover:bg-[#FDEEED] transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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
  );
}

