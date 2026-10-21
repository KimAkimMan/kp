"use client";

import React, { useState } from "react";
import { Image as ImageIcon, Calendar, Layers } from "lucide-react";
import { Program, User } from "../../types";
import { quantity, operatorAssignment, getProgramYear } from "../../utils/helpers";

interface HistoryViewProps {
  currentUser: User;
  programs: Program[];
  selectedProgramId: number;
  onSelectProgramId: (id: number) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  currentUser,
  programs,
  selectedProgramId,
  onSelectProgramId,
}) => {
  const [yearFilter, setYearFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const accessiblePrograms = programs.filter((p) => {
    const owner = operatorAssignment(p);
    return (
      !owner ||
      (owner.explicitId
        ? owner.id === String(currentUser.id)
        : owner.name === currentUser.nama)
    );
  });

  const availableYears = Array.from(
    new Set(["2026", "2025", "2024", ...accessiblePrograms.map((p) => getProgramYear(p))])
  ).sort((a, b) => b.localeCompare(a));

  const availableCategories = Array.from(
    new Set([...accessiblePrograms.map((p) => p.kategori).filter(Boolean)])
  );

  const filteredPrograms = accessiblePrograms.filter((p) => {
    if (yearFilter && getProgramYear(p) !== yearFilter) return false;
    if (categoryFilter && p.kategori !== categoryFilter) return false;
    return true;
  });

  const program =
    filteredPrograms.find((p) => p.id === selectedProgramId) ||
    filteredPrograms[0] ||
    programs.find((p) => p.id === selectedProgramId) ||
    accessiblePrograms[0] ||
    programs[0];

  if (!program) {
    return (
      <div className="text-center py-16 text-[#65778B] bg-white rounded-2xl border border-[#E1E9F0]">
        Belum ada kegiatan yang tersedia.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Head */}
      <div>
        <h2 className="text-2xl font-bold text-[#143965]">Riwayat Progres</h2>
        <p className="text-xs sm:text-sm text-[#65778B] mt-0.5">
          Telusuri riwayat tanggal, tahap pekerjaan, dan capaian realisasi fisik yang telah diinput di lapangan.
        </p>
      </div>

      {/* Panel */}
      <section className="bg-white rounded-2xl p-6 border border-[#E1E9F0] shadow-xs">
        {/* Sortir Kategori Tahun */}
        <div className="bg-[#FAFBFD] p-4 rounded-xl border border-[#DFEAF0] mb-5 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#143965] flex items-center gap-1.5 mr-1">
              <Calendar className="w-4 h-4 text-[#1E4E8C]" /> Kategori Tahun:
            </span>
            <button
              type="button"
              onClick={() => setYearFilter("")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                !yearFilter
                  ? "bg-[#1E4E8C] text-white shadow-xs"
                  : "bg-white border border-[#CCD9E4] text-[#496178] hover:bg-[#F0F4F8]"
              }`}
            >
              Semua Tahun ({accessiblePrograms.length})
            </button>
            {availableYears.map((yr) => {
              const count = accessiblePrograms.filter((p) => getProgramYear(p) === yr).length;
              const isActive = yearFilter === yr;
              return (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setYearFilter(isActive ? "" : yr)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    isActive
                      ? "bg-[#1E4E8C] text-white shadow-xs"
                      : "bg-white border border-[#CCD9E4] text-[#496178] hover:bg-[#F0F4F8]"
                  }`}
                >
                  <span>Tahun {yr}</span>
                  <span className="text-[10px] opacity-80">({count})</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#F0F4F8]">
            <span className="text-[11px] font-bold text-[#65778B] flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-[#148B87]" /> Bidang:
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
            {availableCategories.map((c) => {
              const isActive = categoryFilter === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategoryFilter(isActive ? "" : c)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    isActive
                      ? "bg-[#148B87] text-white font-bold"
                      : "bg-white border border-[#CCD9E4] text-[#496178] hover:bg-[#F6F9FB]"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6 pb-4 border-b border-[#EAF0F4]">
          <label className="text-xs font-bold text-[#35536F] uppercase whitespace-nowrap">
            Pilih Kegiatan:
          </label>
          <select
            value={program.id}
            onChange={(e) => onSelectProgramId(Number(e.target.value))}
            className="w-full sm:w-96 border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white font-medium text-[#143965]"
          >
            {filteredPrograms.map((p) => (
              <option key={p.id} value={p.id}>
                [TA {getProgramYear(p)}] {p.nama}
              </option>
            ))}
          </select>
        </div>

        {/* Histories Table */}
        <div className="overflow-x-auto border border-[#E3EBF0] rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F6F9FB] text-[#61738A] uppercase font-bold text-[11px]">
              <tr>
                <th className="p-3.5">Tanggal Update</th>
                <th className="p-3.5">Tahap Pekerjaan</th>
                <th className="p-3.5">Nilai Realisasi</th>
                <th className="p-3.5">Keterangan</th>
                <th className="p-3.5">Dokumentasi</th>
                <th className="p-3.5">Penginput</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAF0F4]">
              {program.histories && program.histories.length > 0 ? (
                program.histories.map((h, i) => (
                  <tr key={i} className="hover:bg-[#FBFDFE] transition">
                    <td className="p-3.5 text-[#65778B] whitespace-nowrap font-medium">
                      {h.tanggal}
                    </td>
                    <td className="p-3.5 font-bold text-[#143965]">{h.tahap}</td>
                    <td className="p-3.5 font-semibold text-[#148B87] whitespace-nowrap">
                      {quantity(h.nilai, h.satuan)}
                    </td>
                    <td className="p-3.5 text-[#496178] max-w-sm">{h.keterangan}</td>
                    <td className="p-3.5 whitespace-nowrap">
                      {h.foto ? (
                        <span className="inline-flex items-center gap-1.5 text-[#1E4E8C] font-semibold">
                          <ImageIcon className="w-3.5 h-3.5" /> Foto tersedia
                        </span>
                      ) : (
                        <span className="text-[#65778B]">Tidak ada</span>
                      )}
                    </td>
                    <td className="p-3.5 text-[#65778B] whitespace-nowrap">
                      {h.penginput}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-[#65778B]">
                    Belum ada catatan riwayat pekerjaan untuk kegiatan ini.
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
