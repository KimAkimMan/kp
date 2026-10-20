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
import {
  calculateSummary,
  currency,
  quantity,
  matchProgram,
  downloadBlob,
  operatorAssignment,
} from "../../utils/helpers";

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

  const filtered = accessiblePrograms.filter((p) => matchProgram(p, searchTerm));
  const summary = calculateSummary(filtered);

  // Download TXT
  const handleDownloadTxt = () => {
    const lines = [
      "================================================================================",
      "             LAPORAN MONITORING DAN PELAPORAN CAPAIAN PROGRAM",
      "      DINAS PERUMAHAN, KAWASAN PERMUKIMAN DAN PERTANAHAN KABUPATEN KUNINGAN",
      "                             TAHUN ANGGARAN 2026",
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
          `${idx + 1}. [${p.kode}] ${p.nama}`,
          `   Lokasi       : ${p.lokasi}`,
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
    ];

    downloadBlob("Laporan-Monitoring-Permukiman-Kuningan.txt", lines.join("\n"));
    onNotify("File laporan (TXT) berhasil disiapkan dan diunduh.");
  };

  // Download CSV
  const handleDownloadCsv = () => {
    const headers = [
      "Kode Kegiatan",
      "Nama Kegiatan",
      "Kategori",
      "Lokasi",
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
      `"${p.kode}"`,
      `"${p.nama.replace(/"/g, '""')}"`,
      `"${p.kategori}"`,
      `"${p.lokasi.replace(/"/g, '""')}"`,
      `"${p.pj}"`,
      `"${(p.penyedia || "").replace(/"/g, '""')}"`,
      `"${p.noKontrak || ""}"`,
      p.pagu,
      p.penggunaan,
      Math.max(0, p.pagu - p.penggunaan),
      p.target,
      p.realisasi,
      `"${p.satuan}"`,
      `"${p.status}"`,
      `"${p.update}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    downloadBlob("Laporan-Monitoring-Permukiman-Kuningan.csv", csvContent, "text/csv;charset=utf-8;");
    onNotify("File spreadsheet Excel (CSV) berhasil disiapkan dan diunduh.");
  };

  return (
    <div className="space-y-6">
      {/* Head */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h2 className="text-2xl font-bold text-[#143965]">Laporan Monitoring</h2>
          <p className="text-xs sm:text-sm text-[#65778B] mt-0.5">
            Ringkasan capaian fisik target, realisasi, pagu, dan sisa anggaran seluruh kegiatan.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadTxt}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#E8F2F8] text-[#1E4E8C] hover:bg-[#D8EAF5] transition shadow-xs"
          >
            <FileDown className="w-4 h-4" /> Unduh PDF
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
            <Printer className="w-4 h-4" /> Cetak
          </button>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="hidden print:block text-center border-b pb-4 mb-4">
        <h1 className="text-xl font-bold text-[#143965]">
          DINAS PERUMAHAN, KAWASAN PERMUKIMAN DAN PERTANAHAN KABUPATEN KUNINGAN
        </h1>
        <h2 className="text-sm font-semibold text-[#65778B]">
          LAPORAN CAPAIAN PROGRAM DAN REALISASI FISIK & KEUANGAN
        </h2>
        <p className="text-xs text-[#65778B]">Tahun Anggaran 2026</p>
      </div>

      {/* Main Panel */}
      <section className="bg-white rounded-2xl p-6 border border-[#E1E9F0] shadow-xs print:border-none print:shadow-none print:p-0">
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
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#E8F2F8] text-[#1E4E8C] hover:bg-[#D8EAF5] transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          )}
        </div>

        {/* Budget Summary Bar */}
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

        {/* Report Table */}
        <div className="overflow-x-auto border border-[#E3EBF0] rounded-xl">
          <table className="w-full text-xs text-left min-w-[950px]">
            <thead className="bg-[#F6F9FB] text-[#61738A] uppercase font-bold text-[11px]">
              <tr>
                <th className="p-3">Kode / No. SPK</th>
                <th className="p-3">Nama Kegiatan</th>
                <th className="p-3">Lokasi</th>
                <th className="p-3">Pagu (Rp)</th>
                <th className="p-3">Penggunaan (Rp)</th>
                <th className="p-3">Target</th>
                <th className="p-3">Realisasi</th>
                <th className="p-3">Capaian</th>
                <th className="p-3">Status</th>
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

                  return (
                    <tr key={p.id} className="hover:bg-[#FBFDFE]">
                      <td className="p-3 text-[#65778B] font-mono whitespace-nowrap">
                        {p.noKontrak || p.kode}
                      </td>
                      <td className="p-3 font-bold text-[#143965] max-w-[220px]">
                        {p.nama}
                      </td>
                      <td className="p-3 text-[#65778B] max-w-[200px] truncate">
                        {p.lokasi}
                      </td>
                      <td className="p-3 font-semibold text-[#143965] whitespace-nowrap">
                        {currency(p.pagu)}
                      </td>
                      <td className="p-3 font-semibold text-[#148B87] whitespace-nowrap">
                        {currency(p.penggunaan)}
                      </td>
                      <td className="p-3 text-[#18304B] whitespace-nowrap">
                        {quantity(p.target, p.satuan)}
                      </td>
                      <td className="p-3 font-bold text-[#148B87] whitespace-nowrap">
                        {quantity(p.realisasi, p.satuan)}
                      </td>
                      <td className="p-3 font-bold text-[#1E4E8C] whitespace-nowrap">
                        {percent}%
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`badge ${badgeClass}`}>{p.status}</span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-10 text-[#65778B]">
                    Tidak ada data kegiatan untuk laporan saat ini.
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
