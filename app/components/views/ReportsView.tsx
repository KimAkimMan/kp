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
import { Button } from "@/app/components/ui/Button";
import { Input, Select } from "@/app/components/ui/Input";

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
          <Select
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
          </Select>
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
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari kegiatan, lokasi, kategori, atau penanggung jawab..."
              className="pl-10 pr-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#8FC5E7]"
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 bg-[#F8FAFC] p-4 rounded-xl border border-[#DFEAF0] print:border print:border-[#CBD5E1] print:bg-[#F8FAFC] print:p-3 print:mb-4 print:grid-cols-4">
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
