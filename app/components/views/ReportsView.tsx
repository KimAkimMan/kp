"use client";

import React, { useEffect, useState } from "react";
import { FileDown, Search, RotateCcw } from "lucide-react";
import { Program, User } from "../../types";
import { standardCategories } from "../../data/initialData";
import {
  calculateSummary,
  currency,
  quantity,
  matchProgram,
  operatorAssignment,
  getProgramYear,
  getProgramDesa,
  getProgramKecamatan,
} from "../../utils/helpers";
import {
  downloadReportExcel,
  downloadReportPdf,
  downloadReportWord,
} from "../../utils/report-export";
import { ActivityFilters } from "./ActivityFilters";
import { ApiClientError, reportApi, type ReportSummary } from "@/lib/api";

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
  const [backendSummary, setBackendSummary] = useState<ReportSummary | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<"xlsx" | "docx" | "pdf">("xlsx");
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void reportApi
      .summary({ periode: yearFilter || undefined })
      .then((response) => {
        if (!cancelled) {
          setReportError(null);
          setBackendSummary(response.data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setBackendSummary(null);
          setReportError(
            error instanceof ApiClientError
              ? error.message
              : "Ringkasan laporan dari server gagal dimuat.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [yearFilter]);

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

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const options = {
        programs: filtered,
        yearFilter,
        categoryFilter,
        generatedBy: `${currentUser.nama} (${currentUser.role})`,
      };

      if (exportFormat === "xlsx") {
        await downloadReportExcel(options);
      } else if (exportFormat === "docx") {
        await downloadReportWord(options);
      } else {
        downloadReportPdf(options);
      }

      onNotify(`Laporan berhasil diunduh dalam format ${exportFormat.toUpperCase()}.`);
    } catch (error) {
      const details = error instanceof Error ? `: ${error.message}` : "";
      onNotify(`Gagal menyiapkan laporan ${exportFormat.toUpperCase()}${details}`);
    } finally {
      setIsExporting(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setYearFilter("");
    setCategoryFilter("");
  };

  return (
    <div className="space-y-6 report-print-root">
      {/* Head */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
        <div>
          <h2 className="text-2xl font-bold text-[#143965]">Laporan &amp; Rekapitulasi</h2>
          <p className="text-xs sm:text-sm text-[#65778B] mt-0.5">
            Ekspor rekapitulasi capaian fisik dan keuangan kegiatan dinas per kategori tahun.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor="report-export-format">
            Format unduhan laporan
          </label>
          <select
            id="report-export-format"
            value={exportFormat}
            onChange={(event) => {
              const value = event.target.value;
              if (value === "xlsx" || value === "docx" || value === "pdf") {
                setExportFormat(value);
              }
            }}
            className="px-3 py-2 rounded-xl text-xs font-semibold border border-[#CCD9E4] bg-white text-[#1E4E8C] focus:outline-none focus:ring-2 focus:ring-[#8FC5E7]"
          >
            <option value="xlsx">Excel (.xlsx)</option>
            <option value="docx">Word (.docx)</option>
            <option value="pdf">PDF (.pdf)</option>
          </select>
          <button
            onClick={() => void handleExport()}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#1E4E8C] text-white hover:bg-[#143965] disabled:opacity-60 disabled:cursor-wait transition shadow-xs"
          >
            <FileDown className="w-4 h-4" />
            {isExporting ? "Menyiapkan..." : "Unduh Laporan"}
          </button>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="hidden print:block text-center border-b pb-4 mb-4">
        <h1 className="text-xl font-bold text-[#143965]">
          DINAS PERUMAHAN, KAWASAN PERMUKIMAN DAN PERTANAHAN KABUPATEN KUNINGAN
        </h1>
        <h2 className="text-sm font-semibold text-[#65778B]">
          LAPORAN CAPAIAN KEGIATAN DAN REALISASI FISIK &amp; KEUANGAN
        </h2>
        <p className="text-xs text-[#65778B]">
          Kategori Tahun Anggaran: {yearFilter || "Semua Tahun"}
        </p>
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

        {(backendSummary || reportError) && (
          <div className={`mb-4 text-xs rounded-xl px-3.5 py-2.5 border no-print ${
            reportError
              ? "bg-[#FDEEED] border-[#F8C8C4] text-[#BD493B]"
              : "bg-[#F6F9FB] border-[#E1E9F0] text-[#65778B]"
          }`}>
            {reportError
              ? reportError
              : `Ringkasan backend: ${backendSummary?.count ?? 0} kegiatan${
                  yearFilter ? ` pada periode ${yearFilter}` : ""
                }.`}
          </div>
        )}

        {/* Budget Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 bg-[#F8FAFC] p-4 rounded-xl border border-[#DFEAF0]">
          <div>
            <p className="text-[11px] text-[#65778B] font-medium m-0">Pagu Total</p>
            <strong className="block text-sm sm:text-base font-bold text-[#143965] mt-0.5 truncate">
              {currency(
                backendSummary?.totals._sum.pagu
                  ? Number(backendSummary.totals._sum.pagu)
                  : summary.pagu,
              )}
            </strong>
          </div>
          <div>
            <p className="text-[11px] text-[#65778B] font-medium m-0">Penggunaan</p>
            <strong className="block text-sm sm:text-base font-bold text-[#148B87] mt-0.5 truncate">
              {currency(
                backendSummary?.totals._sum.penggunaan
                  ? Number(backendSummary.totals._sum.penggunaan)
                  : summary.penggunaan,
              )}
            </strong>
          </div>
          <div>
            <p className="text-[11px] text-[#65778B] font-medium m-0">Sisa Anggaran</p>
            <strong className="block text-sm sm:text-base font-bold text-[#E78A31] mt-0.5 truncate">
              {backendSummary
                ? currency(
                    Number(backendSummary.totals._sum.pagu ?? 0) -
                      Number(backendSummary.totals._sum.penggunaan ?? 0),
                  )
                : currency(summary.sisaAnggaran)}
            </strong>
          </div>
          <div>
            <p className="text-[11px] text-[#65778B] font-medium m-0">Total Kegiatan</p>
            <strong className="block text-sm sm:text-base font-bold text-[#143965] mt-0.5">
              {(backendSummary?.count ?? filtered.length)} Kegiatan
            </strong>
          </div>
        </div>

        {/* Report Table */}
        <div className="overflow-x-auto border border-[#E3EBF0] rounded-xl report-print-table-wrapper">
          <table className="w-full text-xs text-left min-w-[1000px] report-print-table">
            <thead className="bg-[#F6F9FB] text-[#61738A] uppercase font-bold text-[11px]">
              <tr>
                <th className="p-3">Tahun / Kode</th>
                <th className="p-3">Nama Kegiatan</th>
                <th className="p-3">Kategori</th>
                <th className="p-3">Lokasi (Desa &amp; Kec)</th>
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

                  const yearDisplay = getProgramYear(p);
                  const desaDisplay = getProgramDesa(p);
                  const kecamatanDisplay = getProgramKecamatan(p);

                  return (
                    <tr key={p.id} className="hover:bg-[#FBFDFE]">
                      <td className="p-3 whitespace-nowrap">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E8F2F8] text-[#1E4E8C] mr-1.5">
                          TA {yearDisplay}
                        </span>
                        <span className="text-[#65778B] font-mono">{p.noKontrak || p.kode}</span>
                      </td>
                      <td className="p-3 font-bold text-[#143965] max-w-[220px]">
                        {p.nama}
                      </td>
                      <td className="p-3 text-[#496178] whitespace-nowrap">
                        <span className="bg-[#EDF5FB] text-[#1E4E8C] px-2 py-0.5 rounded text-[11px] font-semibold">
                          {p.kategori}
                        </span>
                      </td>
                      <td className="p-3 text-[#65778B] max-w-[200px] truncate">
                        {desaDisplay}, Kec. {kecamatanDisplay}
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
                  <td colSpan={10} className="text-center py-10 text-[#65778B]">
                    Tidak ada data kegiatan untuk kategori tahun yang dipilih.
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
