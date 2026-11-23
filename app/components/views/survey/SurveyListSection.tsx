"use client";

import React from "react";
import { Search, ClipboardCheck, Plus, Eye, Edit3, Trash2 } from "lucide-react";
import { FieldSurvey } from "../../../types";
import { currency } from "../../../utils/helpers";
import { defaultKecamatanList } from "../../../data/initialData";
import { Select } from "@/app/components/ui/Input";

interface SurveyListSectionProps {
  surveys: FieldSurvey[];
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  filterKecamatan: string;
  setFilterKecamatan: (v: string) => void;
  filterKondisi: string;
  setFilterKondisi: (v: string) => void;
  onViewSurvey: (srv: FieldSurvey) => void;
  onEditSurvey: (srv: FieldSurvey) => void;
  onDeleteSurvey: (id: string) => void;
  isAdmin: boolean;
  onAddSurvey: () => void;
}

export function SurveyListSection({
  surveys,
  searchTerm,
  setSearchTerm,
  filterKecamatan,
  setFilterKecamatan,
  filterKondisi,
  setFilterKondisi,
  onViewSurvey,
  onEditSurvey,
  onDeleteSurvey,
  isAdmin,
  onAddSurvey,
}: SurveyListSectionProps) {
  const filteredSurveys = surveys.filter((s) => {
    const matchSearch =
      !searchTerm ||
      s.namaKegiatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.desaKelurahan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.detailLokasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.kodeSurvey.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.surveyor.toLowerCase().includes(searchTerm.toLowerCase());

    const matchKecamatan = !filterKecamatan || s.kecamatan === filterKecamatan;
    const matchKondisi = !filterKondisi || s.kondisi === filterKondisi;

    return matchSearch && matchKecamatan && matchKondisi;
  });

  const badgeKondisi = (kondisi: string) =>
    kondisi === "Baik"
      ? "bg-[#E7F6ED] text-[#258050] border-[#C8E8D5]"
      : kondisi === "Rusak Ringan"
      ? "bg-[#FEF7E9] text-[#B07300] border-[#FCE6BD]"
      : kondisi === "Rusak Sedang"
      ? "bg-[#FFF3E8] text-[#BD6C1E] border-[#FCDDC0]"
      : "bg-[#FDEEED] text-[#BD493B] border-[#F8C8C4]";

  const urgencyColor = (tingkatUrgensi: string) =>
    tingkatUrgensi === "Tinggi / Mendesak"
      ? "text-[#BD493B]"
      : tingkatUrgensi === "Sedang"
      ? "text-[#BD6C1E]"
      : "text-[#258050]";

  return (
    <section className="bg-white rounded-2xl border border-[#E1E9F0] shadow-xs overflow-hidden">
      {/* Filters Bar */}
      <div className="p-5 border-b border-[#EAF0F4] space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-base font-bold text-[#143965]">Daftar Hasil Survey Lapangan</h3>
            <p className="text-xs text-[#65778B] mt-0.5">
              Menampilkan data survey yang telah diinput oleh Operator Disperkimtan Kuningan
            </p>
          </div>
          <button onClick={onAddSurvey} className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1E4E8C] text-white hover:bg-[#143965] flex items-center gap-1.5 shadow-xs transition">
            <Plus className="w-3.5 h-3.5" /> Tambah Survey Baru
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#8AA2B5] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari lokasi, desa, kode survey..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-[#CCD9E4] rounded-xl text-xs bg-white focus:outline-none"
            />
          </div>

          {/* Filter Kecamatan */}
          <Select value={filterKecamatan} onChange={(e) => setFilterKecamatan(e.target.value)} className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-xs bg-white text-[#35536F]">
            <option value="">Semua Kecamatan</option>
            {defaultKecamatanList.map((k: string) => (
              <option key={k} value={k}>
                Kecamatan {k}
              </option>
            ))}
          </Select>

          {/* Filter Kondisi */}
          <Select value={filterKondisi} onChange={(e) => setFilterKondisi(e.target.value)} className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-xs bg-white text-[#35536F]">
            <option value="">Semua Kondisi Fisik</option>
            <option value="Baik">Baik</option>
            <option value="Rusak Ringan">Rusak Ringan</option>
            <option value="Rusak Sedang">Rusak Sedang</option>
            <option value="Rusak Berat">Rusak Berat</option>
          </Select>
        </div>
      </div>

      {/* Table or Cards */}
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
              {filteredSurveys.map((srv) => (
                <tr key={srv.id} className="hover:bg-[#F9FBFC] transition">
                  {/* Kode & Tanggal */}
                  <td className="p-3.5 whitespace-nowrap">
                    <span className="font-bold text-[#143965] block">{srv.kodeSurvey}</span>
                    <span className="text-[11px] text-[#65778B]">{srv.tanggal}</span>
                    <span className="block text-[10px] text-[#1E4E8C] font-semibold mt-0.5">Oleh: {srv.surveyor}</span>
                  </td>

                  {/* Nama & Lokasi */}
                  <td className="p-3.5 min-w-[220px]">
                    <strong className="block text-[#143965] text-sm leading-snug">{srv.namaKegiatan}</strong>
                    <span className="text-[11px] text-[#65778B] block mt-0.5">{srv.detailLokasi || `${srv.desaKelurahan}, Kec. ${srv.kecamatan}`}</span>
                    <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-[#EAF0F4] text-[#1E4E8C]">{srv.kategori}</span>
                  </td>

                  {/* Kondisi */}
                  <td className="p-3.5 whitespace-nowrap">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${badgeKondisi(srv.kondisi)}`}>{srv.kondisi}</span>
                  </td>

                  {/* Dimensi */}
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

                  {/* Estimasi Biaya */}
                  <td className="p-3.5 whitespace-nowrap font-bold text-[#148B87]">{srv.estimasiBiaya ? currency(srv.estimasiBiaya) : "—"}</td>

                  {/* Urgensi */}
                  <td className="p-3.5 whitespace-nowrap">
                    <span className={`font-semibold text-[11px] ${urgencyColor(srv.tingkatUrgensi)}`}>{srv.tingkatUrgensi}</span>
                  </td>

                  {/* Status */}
                  <td className="p-3.5 whitespace-nowrap">
                    <span className="badge selesai text-[11px] font-bold">{srv.status}</span>
                  </td>

                  {/* Aksi */}
                  <td className="p-3.5 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => onViewSurvey(srv)} title="Lihat Detail Survey" className="p-1.5 rounded-lg text-[#1E4E8C] hover:bg-[#E8F2F8] transition">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => onEditSurvey(srv)} title="Edit Data Survey" className="p-1.5 rounded-lg text-[#148B87] hover:bg-[#EAF6F5] transition">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {isAdmin && (
                        <button onClick={() => onDeleteSurvey(srv.id)} title="Hapus Data Survey" className="p-1.5 rounded-lg text-[#BD493B] hover:bg-[#FDEEED] transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-[#65778B] p-6">
          <ClipboardCheck className="w-10 h-10 mx-auto text-[#9BB1C2] mb-2" />
          <p className="font-bold text-sm text-[#143965]">Belum ada data survey yang cocok.</p>
          <p className="text-xs text-[#65778B] mt-0.5">Coba sesuaikan kata kunci pencarian atau buat formulir survey lapangan baru.</p>
        </div>
      )}
    </section>
  );
}
