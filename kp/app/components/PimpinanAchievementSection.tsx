"use client";

import React, { useState, useMemo } from "react";
import { Download } from "lucide-react";
import { Program } from "../types";
import { HorizontalPercentageBarChart, HorizontalBarItem } from "./Charts";

// ─── Types ────────────────────────────────────────────────────────────────────

type PeriodeType = "tahunan" | "triwulan" | "bulanan";

interface CategoryStat {
  kategori: string;
  satuan: string;
  target: number;
  realisasi: number;
  sisa: number;
  persentase: number;           // actual (can exceed 100)
  clampedPersentase: number;    // capped at 100 for overall avg
  status: "Tercapai" | "Sedang Berjalan" | "Tertinggal";
  color: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number, decimals = 0): string {
  return n.toLocaleString("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtPct(n: number): string {
  return n.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%";
}

/** Return status label and bar color based on percentage thresholds */
function resolveStatus(pct: number): { status: CategoryStat["status"]; color: string } {
  if (pct >= 90) return { status: "Tercapai", color: "#258050" };
  if (pct >= 60) return { status: "Sedang Berjalan", color: "#E78A31" };
  return { status: "Tertinggal", color: "#BD493B" };
}

/** Badge class for status */
function statusBadgeClass(status: CategoryStat["status"]): string {
  if (status === "Tercapai") return "bg-[#E7F6ED] text-[#258050] border border-[#C8E8D5]";
  if (status === "Sedang Berjalan") return "bg-[#FEF7E9] text-[#B07300] border border-[#FCE6BD]";
  return "bg-[#FDEEED] text-[#BD493B] border border-[#F8C8C4]";
}

const MONTHS_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const TRIWULAN_MONTHS: Record<number, number[]> = {
  1: [1, 2, 3],
  2: [4, 5, 6],
  3: [7, 8, 9],
  4: [10, 11, 12],
};

/**
 * Proportionally scale a program's target to the selected period.
 * For now we use a simple uniform distribution (1/12 per month).
 * A footnote is shown to the user to explain this assumption.
 */
function scaledTarget(target: number, monthsInPeriod: number): number {
  return (target / 12) * monthsInPeriod;
}

/**
 * Estimate how much realisasi falls within a period.
 * Since we don't have per-month realisasi, we scale proportionally
 * (same uniform assumption) – same footnote applies.
 */
function scaledRealisasi(realisasi: number, monthsInPeriod: number): number {
  return (realisasi / 12) * monthsInPeriod;
}

// ─── Main computation ─────────────────────────────────────────────────────────

function computeStats(
  programs: Program[],
  periodeType: PeriodeType,
  year: number,
  month: number,
  triwulan: number,
): { stats: CategoryStat[]; isProportional: boolean } {
  const isAnnual = periodeType === "tahunan";
  let monthsInPeriod = 12;
  if (periodeType === "bulanan") monthsInPeriod = 1;
  if (periodeType === "triwulan") monthsInPeriod = 3;

  const isProportional = !isAnnual;

  // Group programs by (kategori, satuan)
  const groupMap = new Map<string, { target: number; realisasi: number }>();

  for (const p of programs) {
    const key = `${p.kategori}|||${p.satuan}`;
    const existing = groupMap.get(key) ?? { target: 0, realisasi: 0 };

    const t = isAnnual ? p.target : scaledTarget(p.target, monthsInPeriod);
    const r = isAnnual ? p.realisasi : scaledRealisasi(p.realisasi, monthsInPeriod);

    groupMap.set(key, {
      target: existing.target + t,
      realisasi: existing.realisasi + r,
    });
  }

  const stats: CategoryStat[] = [];

  for (const [key, { target, realisasi }] of groupMap.entries()) {
    const [kategori, satuan] = key.split("|||");

    if (target <= 0) {
      // No target – still surface but mark as "-"
      stats.push({
        kategori,
        satuan,
        target: 0,
        realisasi,
        sisa: 0,
        persentase: -1,
        clampedPersentase: 0,
        status: "Tertinggal",
        color: "#BD493B",
      });
      continue;
    }

    const rawPct = (realisasi / target) * 100;
    const sisa = Math.max(0, target - realisasi);
    const { status, color } = resolveStatus(rawPct);

    stats.push({
      kategori,
      satuan,
      target,
      realisasi,
      sisa,
      persentase: rawPct,
      clampedPersentase: Math.min(100, rawPct),
      status,
      color,
    });
  }

  return { stats, isProportional };
}

function overallPct(stats: CategoryStat[]): number {
  const withTarget = stats.filter((s) => s.persentase >= 0);
  if (withTarget.length === 0) return 0;
  const sum = withTarget.reduce((acc, s) => acc + s.clampedPersentase, 0);
  return sum / withTarget.length;
}

// ─── CSV Export ───────────────────────────────────────────────────────────────

function exportCSV(stats: CategoryStat[], periodeLabel: string) {
  const header = "Kategori;Satuan;Target;Realisasi;Sisa;Capaian (%);Status\n";
  const rows = stats
    .map((s) =>
      [
        s.kategori,
        s.satuan,
        s.target.toLocaleString("id-ID", { maximumFractionDigits: 2 }),
        s.realisasi.toLocaleString("id-ID", { maximumFractionDigits: 2 }),
        s.sisa.toLocaleString("id-ID", { maximumFractionDigits: 2 }),
        s.persentase < 0 ? "-" : s.persentase.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
        s.status,
      ].join(";")
    )
    .join("\n");

  const bom = "\uFEFF";
  const blob = new Blob([bom + header + rows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Capaian_Program_${periodeLabel.replace(/\s/g, "_")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}


// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  programs: Program[];
}

export const PimpinanAchievementSection: React.FC<Props> = ({ programs }) => {
  const currentYear = new Date().getFullYear();
  const availableYears = [currentYear - 1, currentYear, currentYear + 1].filter(
    (y) => y >= 2024 && y <= 2035
  );

  // Period filter state
  const [periodeType, setPeriodeType] = useState<PeriodeType>("tahunan");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedTriwulan, setSelectedTriwulan] = useState(
    Math.ceil((new Date().getMonth() + 1) / 3)
  );

  // ── Derived ──────────────────────────────────────────────────────────────
  const { stats, isProportional } = useMemo(
    () => computeStats(programs, periodeType, selectedYear, selectedMonth, selectedTriwulan),
    [programs, periodeType, selectedYear, selectedMonth, selectedTriwulan]
  );

  const overall = useMemo(() => overallPct(stats), [stats]);

  const chartItems: HorizontalBarItem[] = useMemo(
    () =>
      stats
        .filter((s) => s.persentase >= 0)
        .map((s) => ({
          kategori: s.kategori,
          satuan: s.satuan,
          persentase: s.persentase,
          target: s.target,
          realisasi: s.realisasi,
          sisa: s.sisa,
          status: s.status,
          color: s.color,
        })),
    [stats]
  );

  // Label for download filename
  const periodeLabel = useMemo(() => {
    if (periodeType === "tahunan") return `Tahunan_${selectedYear}`;
    if (periodeType === "triwulan") return `TW${selectedTriwulan}_${selectedYear}`;
    return `${MONTHS_ID[selectedMonth - 1]}_${selectedYear}`;
  }, [periodeType, selectedYear, selectedMonth, selectedTriwulan]);

  // Human-readable periode title
  const periodeTitle = useMemo(() => {
    if (periodeType === "tahunan") return `Tahun ${selectedYear}`;
    if (periodeType === "triwulan") return `Triwulan ${selectedTriwulan} – ${selectedYear}`;
    return `${MONTHS_ID[selectedMonth - 1]} ${selectedYear}`;
  }, [periodeType, selectedYear, selectedMonth, selectedTriwulan]);

  // ── Render ────────────────────────────────────────────────────────────────
  const hasData = stats.length > 0;

  return (
    <section className="bg-white rounded-2xl p-6 border border-[#E1E9F0] shadow-xs space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#EAF0F4]">
        <div>
          <h3 className="text-base font-bold text-[#143965]">
            Keseluruhan Pencapaian Program
          </h3>
          <p className="text-xs text-[#65778B] mt-0.5">
            Akumulasi capaian per kategori — persentase dihitung terpisah per satuan.
          </p>
        </div>

        <button
          onClick={() => exportCSV(stats, periodeLabel)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white text-[#1E4E8C] border border-[#C5DCEB] hover:bg-[#E8F2F8] transition shadow-xs shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          Ekspor CSV
        </button>
      </div>

      {/* ── Period Filter ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Type tabs */}
        <div className="flex rounded-xl overflow-hidden border border-[#CCD9E4] text-xs font-bold">
          {(["tahunan", "triwulan", "bulanan"] as PeriodeType[]).map((t) => (
            <button
              key={t}
              onClick={() => setPeriodeType(t)}
              className={`px-3.5 py-2 capitalize transition ${
                periodeType === t
                  ? "bg-[#1E4E8C] text-white"
                  : "bg-white text-[#35536F] hover:bg-[#EEF4F9]"
              }`}
            >
              {t === "tahunan" ? "Tahunan" : t === "triwulan" ? "Triwulan" : "Bulanan"}
            </button>
          ))}
        </div>

        {/* Triwulan selector */}
        {periodeType === "triwulan" && (
          <select
            value={selectedTriwulan}
            onChange={(e) => setSelectedTriwulan(Number(e.target.value))}
            className="border border-[#CCD9E4] rounded-xl px-3 py-2 text-xs bg-white text-[#18304B] font-semibold"
          >
            {[1, 2, 3, 4].map((tw) => (
              <option key={tw} value={tw}>
                TW {tw} (
                {TRIWULAN_MONTHS[tw].map((m) => MONTHS_ID[m - 1].slice(0, 3)).join("–")})
              </option>
            ))}
          </select>
        )}

        {/* Month selector */}
        {periodeType === "bulanan" && (
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="border border-[#CCD9E4] rounded-xl px-3 py-2 text-xs bg-white text-[#18304B] font-semibold"
          >
            {MONTHS_ID.map((m, i) => (
              <option key={i + 1} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
        )}

        {/* Year selector */}
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="border border-[#CCD9E4] rounded-xl px-3 py-2 text-xs bg-white text-[#18304B] font-semibold"
        >
          {availableYears.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* ── Proportional note ── */}
      {isProportional && (
        <p className="text-[11px] text-[#65778B] bg-[#F6F9FB] border border-[#E1E9F0] rounded-xl px-4 py-2.5">
          <strong>Catatan:</strong> Target dan realisasi pada periode ini dihitung secara proporsional rata per bulan dari nilai tahunan, karena data bulanan terperinci belum tersedia.
        </p>
      )}

      {!hasData ? (
        <div className="text-center py-14 border border-dashed border-[#CCD9E4] rounded-xl text-xs text-[#65778B]">
          Belum ada data program untuk periode ini.
        </div>
      ) : (
        <>
          {/* ── Summary KPI Card ── */}
          <div className="bg-gradient-to-r from-[#EAF2FA] to-[#F2F8FD] rounded-2xl p-5 border border-[#C5DCEB]">
            <p className="text-xs font-semibold text-[#65778B] uppercase tracking-wider mb-1">
              Capaian Keseluruhan — {periodeTitle}
            </p>
            <div className="flex flex-wrap items-baseline gap-3 mb-3">
              <span className="text-3xl font-extrabold text-[#1E4E8C]">
                {fmtPct(overall)}
              </span>
              <span className="text-xs text-[#65778B]">rata-rata sederhana (maks. 100% per kategori)</span>
            </div>

            {/* Per-unit pills */}
            <div className="flex flex-wrap gap-2">
              {stats
                .filter((s) => s.persentase >= 0)
                .map((s) => (
                  <span
                    key={`${s.kategori}-${s.satuan}`}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold border"
                    style={{
                      backgroundColor: s.color + "18",
                      color: s.color,
                      borderColor: s.color + "44",
                    }}
                  >
                    {s.kategori}: {fmtPct(s.persentase)} ({s.satuan})
                  </span>
                ))}
            </div>
          </div>

          {/* ── Horizontal Percentage Bar Chart ── */}
          <div>
            <h4 className="text-sm font-bold text-[#143965] mb-3">
              Grafik Capaian per Kategori
            </h4>
            {chartItems.length > 0 ? (
              <HorizontalPercentageBarChart
                items={chartItems}
                height={Math.max(180, chartItems.length * 52 + 60)}
              />
            ) : (
              <div className="text-center py-8 border border-dashed border-[#CCD9E4] rounded-xl text-xs text-[#65778B]">
                Semua kategori tidak memiliki target valid.
              </div>
            )}
          </div>

          {/* ── Data Table ── */}
          <div>
            <h4 className="text-sm font-bold text-[#143965] mb-3">
              Tabel Rincian Capaian
            </h4>
            <div className="overflow-x-auto border border-[#E3EBF0] rounded-xl">
              <table className="w-full text-xs text-left min-w-[680px]">
                <thead className="bg-[#F6F9FB] text-[#61738A] uppercase font-bold text-[11px]">
                  <tr>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Satuan</th>
                    <th className="p-3 text-right">Target</th>
                    <th className="p-3 text-right">Realisasi</th>
                    <th className="p-3 text-right">Sisa</th>
                    <th className="p-3 text-right">Capaian (%)</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAF0F4]">
                  {stats.map((s) => (
                    <tr
                      key={`${s.kategori}-${s.satuan}`}
                      className={`hover:bg-[#FBFDFE] ${
                        s.status === "Tertinggal" ? "bg-[#FFF9F9]" : ""
                      }`}
                    >
                      <td className="p-3 font-semibold text-[#143965]">
                        {s.kategori}
                      </td>
                      <td className="p-3 text-[#65778B]">{s.satuan}</td>
                      <td className="p-3 text-right text-[#18304B]">
                        {s.target > 0 ? fmt(s.target, s.target % 1 !== 0 ? 2 : 0) : "—"}
                      </td>
                      <td className="p-3 text-right text-[#18304B]">
                        {fmt(s.realisasi, s.realisasi % 1 !== 0 ? 2 : 0)}
                      </td>
                      <td className="p-3 text-right text-[#18304B]">
                        {s.target > 0 ? fmt(s.sisa, s.sisa % 1 !== 0 ? 2 : 0) : "—"}
                      </td>
                      <td className="p-3 text-right font-bold" style={{ color: s.color }}>
                        {s.persentase < 0 ? "—" : fmtPct(s.persentase)}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${statusBadgeClass(s.status)}`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </>
      )}
    </section>
  );
};
