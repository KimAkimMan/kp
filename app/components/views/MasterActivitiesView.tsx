"use client";

import React, { useState } from "react";
import { Plus, Search, RotateCcw, Edit2, Eye, Trash2, Calendar, Layers } from "lucide-react";
import { Program } from "../../types";
import {
  currency,
  quantity,
  matchProgram,
  operatorAssignment,
  getProgramYear,
  getProgramDesa,
  getProgramKecamatan,
} from "../../utils/helpers";

interface MasterActivitiesViewProps {
  programs: Program[];
  onOpenAddActivity: () => void;
  onOpenEditActivity: (p: Program) => void;
  onViewProgram: (id: number) => void;
  onDeleteActivity: (p: Program) => void;
}

export const MasterActivitiesView: React.FC<MasterActivitiesViewProps> = ({
  programs,
  onOpenAddActivity,
  onOpenEditActivity,
  onViewProgram,
  onDeleteActivity,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [confirmDeleteActivity, setConfirmDeleteActivity] = useState<Program | null>(null);

  // Dynamic available years
  const availableYears = Array.from(
    new Set(["2026", "2025", "2024", ...programs.map((p) => getProgramYear(p))])
  ).sort((a, b) => b.localeCompare(a));

  // Dynamic available categories
  const availableCategories = Array.from(
    new Set([...programs.map((p) => p.kategori).filter(Boolean)])
  );

  const filteredPrograms = programs.filter(
    (p) =>
      matchProgram(p, searchTerm) &&
      (!yearFilter || getProgramYear(p) === yearFilter) &&
      (!categoryFilter || p.kategori === categoryFilter)
  );

  const handleDeleteConfirm = () => {
    if (confirmDeleteActivity) {
      onDeleteActivity(confirmDeleteActivity);
      setConfirmDeleteActivity(null);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setYearFilter("");
    setCategoryFilter("");
  };

  return (
    <div className="space-y-6">
      {/* Head */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#143965]">Master Kegiatan</h2>
          <p className="text-xs sm:text-sm text-[#65778B] mt-0.5">
            Atur data dasar kegiatan per kategori tahun anggaran, jenis konstruksi, dan pagu anggaran dinas.
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
        {/* Sortir Kategori Berdasarkan Tahun (Pills / Tabs) */}
        <div className="bg-[#FAFBFD] p-4 rounded-xl border border-[#DFEAF0] mb-5 space-y-3.5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#143965] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#1E4E8C]" />
                Sortir Kategori Berdasarkan Tahun Anggaran:
              </span>
              {yearFilter && (
                <span className="text-[11px] font-semibold text-[#1E4E8C] bg-[#E8F2F8] px-2 py-0.5 rounded-md">
                  Menampilkan Kategori Tahun {yearFilter}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setYearFilter("")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  !yearFilter
                    ? "bg-[#1E4E8C] text-white shadow-xs"
                    : "bg-white border border-[#CCD9E4] text-[#496178] hover:bg-[#F0F4F8]"
                }`}
              >
                <span>Semua Tahun</span>
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                    !yearFilter
                      ? "bg-white/20 text-white"
                      : "bg-[#EAF0F4] text-[#496178]"
                  }`}
                >
                  {programs.length}
                </span>
              </button>

              {availableYears.map((yr) => {
                const count = programs.filter(
                  (p) => getProgramYear(p) === yr
                ).length;
                const isActive = yearFilter === yr;
                return (
                  <button
                    key={yr}
                    type="button"
                    onClick={() => setYearFilter(isActive ? "" : yr)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                      isActive
                        ? "bg-[#1E4E8C] text-white shadow-xs"
                        : "bg-white border border-[#CCD9E4] text-[#496178] hover:bg-[#F0F4F8]"
                    }`}
                  >
                    <span>Kategori Tahun {yr}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-[#EAF0F4] text-[#496178]"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub-Kategori Bidang Pekerjaan */}
          <div className="pt-3 border-t border-[#EAF0F4] flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-[#65778B] flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#148B87]" /> Kategori Bidang:
            </span>
            <button
              type="button"
              onClick={() => setCategoryFilter("")}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                !categoryFilter
                  ? "bg-[#148B87] text-white"
                  : "bg-white border border-[#CCD9E4] text-[#65778B] hover:bg-[#F6F9FB]"
              }`}
            >
              Semua Bidang
            </button>
            {availableCategories.map((cat) => {
              const isActive = categoryFilter === cat;
              const count = programs.filter(
                (p) => (!yearFilter || getProgramYear(p) === yearFilter) && p.kategori === cat
              ).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(isActive ? "" : cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    isActive
                      ? "bg-[#148B87] text-white font-bold"
                      : "bg-white border border-[#CCD9E4] text-[#496178] hover:bg-[#F6F9FB]"
                  }`}
                >
                  <span>{cat}</span>
                  <span className="text-[10px] opacity-80">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

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
          {(searchTerm || yearFilter || categoryFilter) && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#E8F2F8] text-[#1E4E8C] hover:bg-[#D8EAF5] transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Filter
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-[#E3EBF0] rounded-xl">
          <table className="w-full text-xs text-left min-w-[1000px]">
            <thead className="bg-[#F6F9FB] text-[#61738A] uppercase font-bold text-[11px]">
              <tr>
                <th className="p-3.5">Tahun / SPK</th>
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
                  const yearDisplay = getProgramYear(p);
                  const desaDisplay = getProgramDesa(p);
                  const kecamatanDisplay = getProgramKecamatan(p);

                  return (
                    <tr key={p.id} className="hover:bg-[#FBFDFE] transition">
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E8F2F8] text-[#1E4E8C] mb-1">
                          TA {yearDisplay}
                        </span>
                        <div className="font-mono text-[#65778B] text-[11px]">
                          {p.noKontrak || p.kode}
                        </div>
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
                        <span className="font-semibold text-[#143965]">{desaDisplay}</span>, Kec. {kecamatanDisplay}
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
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
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
                          <button
                            onClick={() => setConfirmDeleteActivity(p)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#FDEEED] text-[#BD493B] hover:bg-[#F8C8C4] transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-[#65778B]">
                    Tidak ada master kegiatan yang ditemukan untuk kategori yang dipilih.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {confirmDeleteActivity && (
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
              <strong className="text-[#143965]">{confirmDeleteActivity.nama}</strong>? Seluruh data historis akan ikut terhapus.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDeleteActivity(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#F0F4F8] text-[#35536F] hover:bg-[#E1E9F0] transition"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
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
