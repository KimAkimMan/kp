"use client";

import React, { useState } from "react";
import {
  FileDown,
  Sheet,
  Printer,
  Search,
  RotateCcw,
} from "lucide-react";
import { Program, User } from "../../types";
import { standardCategories } from "../../data/initialData";
import {
  calculateSummary,
  currency,
  quantity,
  matchProgram,
  downloadBlob,
  operatorAssignment,
  getProgramYear,
  getProgramDesa,
  getProgramKecamatan,
} from "../../utils/helpers";
import { ActivityFilters } from "./ActivityFilters";

interface ReportsViewProps {
  currentUser: User;
  programs: Program[];
  onNotify: (msg: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  currentUser,
  programs,
  onNotify,
}) => {
  const isOperator = currentUser.role === "Operator";

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

  const [searchTerm, setSearchTerm] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const availableYears = Array.from(
    new Set(["2026", "2025", "2024", ...accessiblePrograms.map((p) => getProgramYear(p))])
  ).sort((a, b) => b.localeCompare(a));

  const availableCategories = Array.from(
    new Set([...standardCategories, ...accessiblePrograms.map((p) => p.kategori).filter(Boolean)])
  );

  const filtered = accessiblePrograms.filter(
    (p) =>
      matchProgram(p, searchTerm) &&
      (!yearFilter || getProgramYear(p) === yearFilter) &&
      (!categoryFilter || p.kategori === categoryFilter)
  );

  const summary = calculateSummary(filtered);

  // Download TXT
  const handleDownloadTxt = () => {
    const lines = [
      "================================================================================",
      "             LAPORAN MONITORING DAN PELAPORAN CAPAIAN KEGIATAN",
      "      DINAS PERUMAHAN, KAWASAN PERMUKIMAN DAN PERTANAHAN KABUPATEN KUNINGAN",
      `                   KATEGORI TAHUN ANGGARAN: ${yearFilter || "SEMUA TAHUN"}`,
      categoryFilter ? `                   KATEGORI BIDANG: ${categoryFilter}` : "",
      "================================================================================",
      `Dicetak oleh : ${currentUser.nama} (${currentUser.role})`,
      `Waktu cetak  : ${new Date().toLocaleString("id-ID")}`,
      `Total Pagu   : ${currency(summary.pagu)}`,
      `Penggunaan   : ${currency(summary.penggunaan)}`,
      `Sisa Pagu    : ${currency(summary.sisaAnggaran)}`,
      "--------------------------------------------------------------------------------",
      "",
      ...filtered.map((p, idx) => {
        return [
          `${idx + 1}. [TA ${getProgramYear(p)} - ${p.kode}] ${p.nama}`,
          `   Lokasi       : ${p.lokasi}`,
          `   Desa/Kec     : ${getProgramDesa(p)}, Kec. ${getProgramKecamatan(p)}`,
          `   Kategori     : ${p.kategori}`,
          `   Penyedia     : ${p.penyedia || "-"}`,
          `   No. Kontrak  : ${p.noKontrak || "-"}`,
          `   Pagu         : ${currency(p.pagu)}`,
          `   Penggunaan   : ${currency(p.penggunaan)}`,
          `   Target       : ${quantity(p.target, p.satuan)}`,
          `   Realisasi    : ${quantity(p.realisasi, p.satuan)}`,
          `   Status       : ${p.status}`,
          `   Update       : ${p.update}`,
          `   Keterangan   : ${p.catatan}`,
          "--------------------------------------------------------------------------------",
        ].join("\n");
      }),
    ].filter(Boolean);

    downloadBlob("Laporan-Monitoring-Permukiman-Kuningan.txt", lines.join("\n"));
    onNotify("File laporan (TXT) berhasil disiapkan dan diunduh.");
  };

  // Download CSV
  const handleDownloadCsv = () => {
    const headers = [
      "Tahun Anggaran",
      "Kode Kegiatan",
      "Nama Kegiatan",
      "Kategori",
      "Desa / Kelurahan",
      "Kecamatan",
      "Penanggung Jawab",
      "Penyedia",
      "No. Kontrak",
      "Pagu Anggaran (Rp)",
      "Penggunaan Biaya (Rp)",
      "Sisa Anggaran (Rp)",
      "Target",
      "Realisasi",
      "Satuan",
      "Status",
      "Update Terakhir",
    ];

    const rows = filtered.map((p) => [
      `"${getProgramYear(p)}"`,
      `"${p.kode}"`,
      `"${p.nama.replace(/"/g, '""')}"`,
      `"${p.kategori}"`,
      `"${getProgramDesa(p)}"`,
      `"${getProgramKecamatan(p)}"`,
      `"${p.pj}"`,
      `"${(p.penyedia || "").replace(/"/g, '""')}"`,
      `"${p.noKontrak || ""}"`,
      p.pagu,
      p.penggunaan,
      p.pagu - p.penggunaan,
      p.target,
      p.realisasi,
      `"${p.satuan}"`,
      `"${p.status}"`,
      `"${p.update}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    downloadBlob("Laporan-Capaian-Permukiman-Kuningan.csv", csvContent, "text/csv;charset=utf-8;");
    onNotify("File laporan (Excel / CSV) berhasil diunduh.");
  };

  const resetFilters = () => {
    setSearchTerm("");
    setYearFilter("");
    setCategoryFilter("");
  };

  return (
    <div className="space-y-6">
      {/* Head */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h2 className="text-2xl font-bold text-[#143965]">Laporan &amp; Rekapitulasi</h2>
          <p className="text-xs sm:text-sm text-[#65778B] mt-0.5">
            Ekspor rekapitulasi capaian fisik dan keuangan kegiatan dinas per kategori tahun.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadTxt}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#E8F2F8] text-[#1E4E8C] hover:bg-[#D8EAF5] transition shadow-xs"
          >
            <FileDown className="w-4 h-4" /> Unduh Dokumen
          </button>
          <button
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#E8F2F8] text-[#1E4E8C] hover:bg-[#D8EAF5] transition shadow-xs"
          >
            <Sheet className="w-4 h-4" /> Unduh Excel
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#1E4E8C] text-white hover:bg-[#143965] transition shadow-xs"
          >
            <Printer className="w-4 h-4" /> Cetak / Ekspor PDF
          </button>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="hidden print:block border-b-2 border-black pb-3 mb-4">
        <div className="text-center">
          <h2 className="text-xs font-bold uppercase tracking-widest text-black">
            PEMERINTAH KABUPATEN KUNINGAN
          </h2>
          <h1 className="text-base font-black uppercase text-black mt-0.5">
            DINAS PERUMAHAN, KAWASAN PERMUKIMAN DAN PERTANAHAN
          </h1>
          <p className="text-[9px] text-gray-700 mt-0.5">
            Jl. Moh. Toha No. 44, Kasturi, Kec. Kuningan, Kabupaten Kuningan, Jawa Barat 45511
          </p>
        </div>
        <div className="border-t border-black mt-2 pt-2 text-center">
          <h3 className="text-sm font-bold uppercase text-black">
            LAPORAN REKAPITULASI CAPAIAN FISIK DAN KEUANGAN KEGIATAN
          </h3>
          <div className="flex justify-between items-center text-[10px] text-gray-700 mt-1 px-1">
            <span>
              <strong>Tahun Anggaran:</strong> {yearFilter || "Semua Tahun"}
              {categoryFilter ? ` · Bidang: ${categoryFilter}` : ""}
            </span>
            <span>
              <strong>Waktu Cetak:</strong>{" "}
              {new Date().toLocaleString("id-ID", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
            <span>
              <strong>Petugas:</strong> {currentUser.nama} ({currentUser.role})
            </span>
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <section className="bg-white rounded-2xl p-6 border border-[#E1E9F0] shadow-xs print:border-none print:shadow-none print:p-0">
        <ActivityFilters
          years={availableYears}
          categories={availableCategories}
          yearFilter={yearFilter}
          categoryFilter={categoryFilter}
          totalCount={accessiblePrograms.length}
          onYearChange={setYearFilter}
          onCategoryChange={setCategoryFilter}
          onReset={resetFilters}
          showReset
          className="mb-5 no-print"
        />

        {/* Search */}
        <div className="flex flex-wrap items-center gap-3 mb-5 no-print">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-[#718296] absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari kegiatan, lokasi, kategori, atau penanggung jawab..."
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

        {/* Budget Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 bg-[#F8FAFC] p-4 rounded-xl border border-[#DFEAF0] print:border print:border-[#CBD5E1] print:bg-[#F8FAFC] print:p-3 print:mb-4 print:grid-cols-4">
          <div>
            <p className="text-[11px] text-[#65778B] font-medium m-0 print:text-black">Pagu Total</p>
            <strong className="block text-sm sm:text-base font-bold text-[#143965] mt-0.5 truncate print:truncate-none print:text-black">
              {currency(summary.pagu)}
            </strong>
          </div>
          <div>
            <p className="text-[11px] text-[#65778B] font-medium m-0 print:text-black">Penggunaan</p>
            <strong className="block text-sm sm:text-base font-bold text-[#148B87] mt-0.5 truncate print:truncate-none print:text-black">
              {currency(summary.penggunaan)}
            </strong>
          </div>
          <div>
            <p className="text-[11px] text-[#65778B] font-medium m-0 print:text-black">Sisa Anggaran</p>
            <strong className="block text-sm sm:text-base font-bold text-[#E78A31] mt-0.5 truncate print:truncate-none print:text-black">
              {currency(summary.sisaAnggaran)}
            </strong>
          </div>
          <div>
            <p className="text-[11px] text-[#65778B] font-medium m-0 print:text-black">Total Kegiatan</p>
            <strong className="block text-sm sm:text-base font-bold text-[#143965] mt-0.5 print:text-black">
              {filtered.length} Kegiatan
            </strong>
          </div>
        </div>

        {/* Report Table */}
        <div className="overflow-x-auto border border-[#E3EBF0] rounded-xl print:overflow-visible print:border-none">
          <table className="w-full text-xs text-left min-w-[1000px] print:min-w-0 print:w-full print:text-[10px] print-table border-collapse">
            <thead className="bg-[#F6F9FB] text-[#61738A] uppercase font-bold text-[11px] print:bg-[#EDF2F7] print:text-black">
              <tr>
                <th className="p-3 print:p-1.5 print:w-[9%]">Tahun / Kode</th>
                <th className="p-3 print:p-1.5 print:w-[18%]">Nama Kegiatan</th>
                <th className="p-3 print:p-1.5 print:w-[10%]">Kategori</th>
                <th className="p-3 print:p-1.5 print:w-[16%]">Lokasi (Desa &amp; Kec)</th>
                <th className="p-3 print:p-1.5 print:w-[10%] text-right print:text-right">Pagu (Rp)</th>
                <th className="p-3 print:p-1.5 print:w-[10%] text-right print:text-right">Penggunaan (Rp)</th>
                <th className="p-3 print:p-1.5 print:w-[8%] text-right print:text-right">Target</th>
                <th className="p-3 print:p-1.5 print:w-[8%] text-right print:text-right">Realisasi</th>
                <th className="p-3 print:p-1.5 print:w-[5%] text-center print:text-center">Capaian</th>
                <th className="p-3 print:p-1.5 print:w-[6%] text-center print:text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAF0F4]">
              {filtered.length > 0 ? (
                filtered.map((p) => {
                  const percent = p.target > 0 ? Math.round((p.realisasi / p.target) * 100) : 0;
                  const badgeClass =
                    p.status === "Belum Dikerjakan"
                      ? "belum"
                      : p.status === "Sedang Dikerjakan"
                      ? "sedang"
                      : "selesai";

                  const yearDisplay = getProgramYear(p);
                  const desaDisplay = getProgramDesa(p);
                  const kecamatanDisplay = getProgramKecamatan(p);

                  return (
                    <tr key={p.id} className="hover:bg-[#FBFDFE] print:break-inside-avoid">
                      <td className="p-3 whitespace-nowrap print:p-1.5 print:whitespace-normal">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E8F2F8] text-[#1E4E8C] mr-1.5 print:bg-transparent print:p-0">
                          TA {yearDisplay}
                        </span>
                        <span className="text-[#65778B] font-mono print:text-black block print:text-[9px]">{p.noKontrak || p.kode}</span>
                      </td>
                      <td className="p-3 font-bold text-[#143965] max-w-[220px] print:max-w-none print:p-1.5 print:text-black print:break-words">
                        {p.nama}
                      </td>
                      <td className="p-3 text-[#496178] whitespace-nowrap print:p-1.5 print:whitespace-normal">
                        <span className="bg-[#EDF5FB] text-[#1E4E8C] px-2 py-0.5 rounded text-[11px] font-semibold print:bg-transparent print:p-0 print:text-black">
                          {p.kategori}
                        </span>
                      </td>
                      <td className="p-3 text-[#65778B] max-w-[200px] truncate print:max-w-none print:whitespace-normal print:overflow-visible print:p-1.5 print:text-black print:break-words">
                        {desaDisplay}, Kec. {kecamatanDisplay}
                      </td>
                      <td className="p-3 font-semibold text-[#143965] whitespace-nowrap text-right print:p-1.5 print:text-black print:text-[10px]">
                        {currency(p.pagu)}
                      </td>
                      <td className="p-3 font-semibold text-[#148B87] whitespace-nowrap text-right print:p-1.5 print:text-black print:text-[10px]">
                        {currency(p.penggunaan)}
                      </td>
                      <td className="p-3 text-[#18304B] whitespace-nowrap text-right print:p-1.5 print:text-black print:text-[10px]">
                        {quantity(p.target, p.satuan)}
                      </td>
                      <td className="p-3 font-bold text-[#148B87] whitespace-nowrap text-right print:p-1.5 print:text-black print:text-[10px]">
                        {quantity(p.realisasi, p.satuan)}
                      </td>
                      <td className="p-3 font-bold text-[#1E4E8C] whitespace-nowrap text-center print:p-1.5 print:text-black print:text-[10px]">
                        {percent}%
                      </td>
                      <td className="p-3 whitespace-nowrap text-center print:p-1.5">
                        <span className={`badge ${badgeClass} print:border print:border-[#94A3B8] print:text-[9px] print:px-1.5 print:py-0.5`}>{p.status}</span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="text-center py-10 text-[#65778B]">
                    Tidak ada data kegiatan untuk kategori tahun yang dipilih.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Printable Signature & Validation Footer */}
        <div className="hidden print:flex justify-between items-start pt-6 mt-4 text-[10px] text-black break-inside-avoid">
          <div className="text-center w-64">
            <p>Mengetahui,</p>
            <p className="font-bold">Pejabat Pembuat Komitmen (PPK)</p>
            <div className="h-14" />
            <p className="font-bold underline">___________________________</p>
            <p className="text-[9px] text-gray-600">NIP. ........................................</p>
          </div>
          <div className="text-center w-64">
            <p>
              Kuningan,{" "}
              {new Date().toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <p className="font-bold">Petugas / Operator Pelapor</p>
            <div className="h-14" />
            <p className="font-bold underline">{currentUser.nama}</p>
            <p className="text-[9px] text-gray-600">{currentUser.role} Dinas PKPP Kuningan</p>
          </div>
        </div>
      </section>
    </div>
  );
};
