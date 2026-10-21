"use client";

import React, { useState } from "react";
import { Search, RotateCcw, Eye, Edit3, Lock, Calendar, Layers } from "lucide-react";
import { Program, User } from "../../types";
import {
  calculateSummary,
  currency,
  quantity,
  matchProgram,
  operatorAssignment,
  canEditProgram,
  getProgramDesa,
  getProgramKecamatan,
  getProgramYear,
} from "../../utils/helpers";
import { defaultKecamatanList } from "../../data/initialData";

interface ProgramsViewProps {
  currentUser: User;
  programs: Program[];
  onViewProgram: (id: number) => void;
  onOpenScheduleModal: (p: Program) => void;
  onClaimProgram: (id: number) => void;
  onNavigateSchedulePage: (id: number) => void;
}

export const ProgramsView: React.FC<ProgramsViewProps> = ({
  currentUser,
  programs,
  onViewProgram,
  onOpenScheduleModal,
  onClaimProgram,
  onNavigateSchedulePage,
}) => {
  const isOperator = currentUser.role === "Operator";

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [kecamatanFilter, setKecamatanFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("terbaru");

  // Dynamic available years based on programs
  const availableYears = Array.from(
    new Set(["2026", "2025", "2024", ...programs.map((p) => getProgramYear(p))])
  ).sort((a, b) => b.localeCompare(a));

  // Dynamic available categories
  const availableCategories = Array.from(
    new Set([...programs.map((p) => p.kategori).filter(Boolean)])
  );

  // Dynamic available kecamatans
  const availableKecamatans = Array.from(
    new Set([
      ...defaultKecamatanList,
      ...programs.map((p) => getProgramKecamatan(p)).filter((k) => k && k !== "—"),
    ])
  );

  // Filter accessible programs
  const accessiblePrograms = isOperator
    ? programs.filter((p) => {
        const owner = operatorAssignment(p);
        return (
          !owner ||
          (owner.explicitId
            ? owner.id === String(currentUser.id)
            : owner.name === currentUser.nama)
        );
      })
    : programs;

  const filtered = accessiblePrograms.filter(
    (p) =>
      matchProgram(p, searchTerm) &&
      (!statusFilter || p.status === statusFilter) &&
      (!kecamatanFilter || p.kecamatan === kecamatanFilter || getProgramKecamatan(p) === kecamatanFilter) &&
      (!yearFilter || getProgramYear(p) === yearFilter) &&
      (!categoryFilter || p.kategori === categoryFilter)
  );

  // Sorting
  filtered.sort((a, b) => {
    if (sortBy === "terlama") return a.id - b.id;
    if (sortBy === "nama-asc") return a.nama.localeCompare(b.nama, "id");
    if (sortBy === "nama-desc") return b.nama.localeCompare(a.nama, "id");
    if (sortBy === "status")
      return a.status.localeCompare(b.status, "id") || a.nama.localeCompare(b.nama, "id");
    return b.id - a.id;
  });

  const summary = calculateSummary(filtered);

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setKecamatanFilter("");
    setYearFilter("");
    setCategoryFilter("");
    setSortBy("terbaru");
  };

  return (
    <div className="space-y-6">
      {/* Head */}
      <div>
        <h2 className="text-2xl font-bold text-[#143965]">
          {isOperator ? "Kegiatan Saya / Data Program" : "Data Program"}
        </h2>
        <p className="text-xs sm:text-sm text-[#65778B] mt-0.5">
          Pilah data kegiatan per kategori tahun anggaran dan kategori bidang, pantau realisasi fisik serta penyerapan anggaran.
        </p>
      </div>

      {/* Main Panel */}
      <section className="bg-white rounded-2xl p-6 border border-[#E1E9F0] shadow-xs">
        {/* Sortir Kategori Berdasarkan Tahun (Pills / Tabs Interaktif) */}
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
                  {accessiblePrograms.length}
                </span>
              </button>

              {availableYears.map((yr) => {
                const count = accessiblePrograms.filter(
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

          {/* Sub-Kategori Bidang Konstruksi */}
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
              const count = accessiblePrograms.filter(
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

        {/* Toolbar Pencarian & Filter Tambahan */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-[#718296] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari kegiatan, lokasi desa/kecamatan, kontraktor, atau penanggung jawab..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-[#CCD9E4] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#8FC5E7]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-[#CCD9E4] rounded-xl px-3 py-2 text-xs font-semibold bg-white text-[#35536F]"
          >
            <option value="">Semua Status</option>
            <option value="Belum Dikerjakan">Belum Dikerjakan</option>
            <option value="Sedang Dikerjakan">Sedang Dikerjakan</option>
            <option value="Selesai Dikerjakan">Selesai Dikerjakan</option>
          </select>

          <select
            value={kecamatanFilter}
            onChange={(e) => setKecamatanFilter(e.target.value)}
            className="border border-[#CCD9E4] rounded-xl px-3 py-2 text-xs font-semibold bg-white text-[#35536F]"
          >
            <option value="">Semua Kecamatan</option>
            {availableKecamatans.map((kec) => (
              <option key={kec} value={kec}>
                {kec}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-[#CCD9E4] rounded-xl px-3 py-2 text-xs font-semibold bg-white text-[#35536F]"
          >
            <option value="terbaru">Terbaru</option>
            <option value="terlama">Terlama</option>
            <option value="nama-asc">Nama A–Z</option>
            <option value="nama-desc">Nama Z–A</option>
            <option value="status">Status</option>
          </select>

          {(searchTerm || statusFilter || kecamatanFilter || yearFilter || categoryFilter || sortBy !== "terbaru") && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#E8F2F8] text-[#1E4E8C] hover:bg-[#D8EAF5] transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Filter
            </button>
          )}
        </div>

        {/* Budget Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 bg-[#F8FAFC] p-4 rounded-xl border border-[#DFEAF0]">
          <div>
            <p className="text-[11px] text-[#65778B] font-medium m-0">Pagu Total</p>
            <strong className="block text-sm sm:text-base font-bold text-[#143965] mt-0.5 truncate">
              {currency(summary.pagu)}
            </strong>
          </div>
          <div>
            <p className="text-[11px] text-[#65778B] font-medium m-0">Penggunaan</p>
            <strong className="block text-sm sm:text-base font-bold text-[#148B87] mt-0.5 truncate">
              {currency(summary.penggunaan)}
            </strong>
          </div>
          <div>
            <p className="text-[11px] text-[#65778B] font-medium m-0">Sisa Anggaran</p>
            <strong className="block text-sm sm:text-base font-bold text-[#E78A31] mt-0.5 truncate">
              {currency(summary.sisaAnggaran)}
            </strong>
          </div>
          <div>
            <p className="text-[11px] text-[#65778B] font-medium m-0">Total Kegiatan</p>
            <strong className="block text-sm sm:text-base font-bold text-[#143965] mt-0.5">
              {filtered.length} Kegiatan
            </strong>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-[#E3EBF0] rounded-xl">
          <table className="w-full text-xs text-left min-w-[1200px]">
            <thead className="bg-[#F6F9FB] text-[#61738A] uppercase font-bold text-[11px]">
              <tr>
                <th className="p-3.5">Tahun / Kode</th>
                <th className="p-3.5">Nama Kegiatan</th>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5">Desa / Kelurahan</th>
                <th className="p-3.5">Kecamatan</th>
                <th className="p-3.5">Operator / PJ</th>
                <th className="p-3.5">Penyedia CV/PT</th>
                <th className="p-3.5">Pagu (Rp)</th>
                <th className="p-3.5">Nilai Kontrak</th>
                <th className="p-3.5">Target</th>
                <th className="p-3.5">Realisasi</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAF0F4]">
              {filtered.length > 0 ? (
                filtered.map((p) => {
                  const assigned = operatorAssignment(p);
                  const editable = canEditProgram(p, currentUser);
                  const isLocked = isOperator && p.status === "Selesai Dikerjakan";
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
                    <tr
                      key={p.id}
                      onClick={() => {
                        if (isOperator) {
                          onNavigateSchedulePage(p.id);
                        } else {
                          onViewProgram(p.id);
                        }
                      }}
                      className="hover:bg-[#FBFDFE] transition cursor-pointer"
                    >
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E8F2F8] text-[#1E4E8C] mb-1">
                          TA {yearDisplay}
                        </span>
                        <div className="text-[#65778B] font-mono text-[11px]">
                          {p.noKontrak || p.kode}
                        </div>
                      </td>
                      <td className="p-3.5 font-bold text-[#143965] max-w-[200px]">
                        {p.nama}
                      </td>
                      <td className="p-3.5 text-[#496178] whitespace-nowrap">
                        <span className="bg-[#EDF5FB] text-[#1E4E8C] px-2 py-0.5 rounded-md text-[11px] font-semibold">
                          {p.kategori}
                        </span>
                      </td>
                      <td className="p-3.5 text-[#143965] font-semibold max-w-[150px] truncate">
                        {desaDisplay}
                      </td>
                      <td className="p-3.5 text-[#496178] whitespace-nowrap">
                        {kecamatanDisplay}
                      </td>
                      <td className="p-3.5 text-[#143965] font-medium whitespace-nowrap">
                        {assigned?.name || "Belum ditugaskan"}
                      </td>
                      <td className="p-3.5 text-[#65778B] whitespace-nowrap">
                        {p.penyedia || "-"}
                      </td>
                      <td className="p-3.5 font-semibold text-[#143965] whitespace-nowrap">
                        {currency(p.pagu)}
                      </td>
                      <td className="p-3.5 text-[#65778B] whitespace-nowrap">
                        {p.nilaiKontrak ? currency(p.nilaiKontrak) : "-"}
                      </td>
                      <td className="p-3.5 text-[#18304B] whitespace-nowrap">
                        {quantity(p.target, p.satuan)}
                      </td>
                      <td className="p-3.5 font-semibold text-[#148B87] whitespace-nowrap">
                        {quantity(p.realisasi, p.satuan)}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className={`badge ${badgeClass}`}>{p.status}</span>
                      </td>
                      <td
                        className="p-3.5 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewProgram(p.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#E8F2F8] text-[#1E4E8C] hover:bg-[#D8EAF5] transition"
                          >
                            <Eye className="w-3.5 h-3.5" /> Lihat
                          </button>

                          {isOperator && (
                            <>
                              {isLocked ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#258050] bg-[#E7F6ED] px-2 py-1 rounded-md">
                                  <Lock className="w-3 h-3" /> Terkunci
                                </span>
                              ) : editable ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => onOpenScheduleModal(p)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#1E4E8C] text-white hover:bg-[#143965] transition shadow-xs"
                                    title="Edit data kegiatan dengan formulir Operator"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" /> Edit Data
                                  </button>
                                  <button
                                    onClick={() => onNavigateSchedulePage(p.id)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#EDF4F8] text-[#1E4E8C] hover:bg-[#D8EAF5] transition"
                                    title="Pembaruan progres fisik"
                                  >
                                    Update Progres
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => onClaimProgram(p.id)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-[#148B87] text-white hover:bg-[#10706D] transition shadow-xs"
                                  title="Ambil kegiatan ini dan edit dengan form Operator"
                                >
                                  <Edit3 className="w-3.5 h-3.5" /> Lengkapi &amp; Edit
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={13} className="text-center py-12 text-[#65778B]">
                    Tidak ada kegiatan yang ditemukan untuk kategori yang dipilih.
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
