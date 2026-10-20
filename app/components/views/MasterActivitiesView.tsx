"use client";

import React, { useState } from "react";
import { Plus, Search, RotateCcw, Edit2, Eye } from "lucide-react";
import { Program } from "../../types";
import { currency, quantity, matchProgram, operatorAssignment } from "../../utils/helpers";

interface MasterActivitiesViewProps {
  programs: Program[];
  onOpenAddActivity: () => void;
  onOpenEditActivity: (p: Program) => void;
  onViewProgram: (id: number) => void;
}

export const MasterActivitiesView: React.FC<MasterActivitiesViewProps> = ({
  programs,
  onOpenAddActivity,
  onOpenEditActivity,
  onViewProgram,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPrograms = programs.filter((p) => matchProgram(p, searchTerm));

  return (
    <div className="space-y-6">
      {/* Head */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#143965]">Master Kegiatan</h2>
          <p className="text-xs sm:text-sm text-[#65778B] mt-0.5">
            Atur data dasar kegiatan, lokasi, jenis konstruksi, dan pagu anggaran dinas.
          </p>
        </div>
        <button
          onClick={onOpenAddActivity}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-[#1E4E8C] text-white hover:bg-[#143965] transition shadow-xs"
        >
          <Plus className="w-4 h-4" /> Tambah Kegiatan
        </button>
      </div>

      {/* Panel */}
      <section className="bg-white rounded-2xl p-6 border border-[#E1E9F0] shadow-xs">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-[#718296] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari kegiatan, jalan, desa, kecamatan, kategori, atau penanggung jawab..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-[#CCD9E4] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#8FC5E7]"
            />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#E8F2F8] text-[#1E4E8C] hover:bg-[#D8EAF5] transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Filter
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-[#E3EBF0] rounded-xl">
          <table className="w-full text-xs text-left min-w-[950px]">
            <thead className="bg-[#F6F9FB] text-[#61738A] uppercase font-bold text-[11px]">
              <tr>
                <th className="p-3.5">Kode / SPK</th>
                <th className="p-3.5">Nama Kegiatan</th>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5">Lokasi</th>
                <th className="p-3.5">Pagu Anggaran</th>
                <th className="p-3.5">Target Volume</th>
                <th className="p-3.5">Realisasi</th>
                <th className="p-3.5">Penanggung Jawab</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAF0F4]">
              {filteredPrograms.length > 0 ? (
                filteredPrograms.map((p) => {
                  const owner = operatorAssignment(p)?.name || "Belum ditugaskan";
                  return (
                    <tr key={p.id} className="hover:bg-[#FBFDFE] transition">
                      <td className="p-3.5 font-medium text-[#65778B] whitespace-nowrap">
                        {p.noKontrak || p.kode}
                      </td>
                      <td className="p-3.5 font-bold text-[#143965]">
                        {p.nama}
                      </td>
                      <td className="p-3.5 text-[#496178] whitespace-nowrap">
                        <span className="bg-[#EDF5FB] text-[#1E4E8C] px-2.5 py-1 rounded-md text-[11px] font-semibold">
                          {p.kategori}
                        </span>
                      </td>
                      <td className="p-3.5 text-[#65778B] max-w-xs truncate">
                        {p.lokasi}
                      </td>
                      <td className="p-3.5 font-semibold text-[#143965] whitespace-nowrap">
                        {currency(p.pagu)}
                      </td>
                      <td className="p-3.5 text-[#18304B] whitespace-nowrap">
                        {quantity(p.target, p.satuan)}
                      </td>
                      <td className="p-3.5 font-medium text-[#148B87] whitespace-nowrap">
                        {quantity(p.realisasi, p.satuan)}
                      </td>
                      <td className="p-3.5 text-[#65778B] whitespace-nowrap">
                        {owner}
                      </td>
                      <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => onViewProgram(p.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#E8F2F8] text-[#1E4E8C] hover:bg-[#D8EAF5] transition"
                        >
                          <Eye className="w-3.5 h-3.5" /> Lihat
                        </button>
                        <button
                          onClick={() => onOpenEditActivity(p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#1E4E8C] text-white hover:bg-[#143965] transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Ubah
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-[#65778B]">
                    Tidak ada master kegiatan yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
