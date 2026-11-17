"use client";

import React from "react";
import { Calendar, Layers, RotateCcw } from "lucide-react";

interface ActivityFiltersProps {
  years: string[];
  categories: string[];
  yearFilter: string;
  categoryFilter: string;
  totalCount: number;
  onYearChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onReset?: () => void;
  showReset?: boolean;
  className?: string;
}

export const ActivityFilters: React.FC<ActivityFiltersProps> = ({
  years,
  categories,
  yearFilter,
  categoryFilter,
  totalCount,
  onYearChange,
  onCategoryChange,
  onReset,
  showReset = false,
  className = "",
}) => (
  <div
    className={`flex flex-wrap items-center gap-2.5 rounded-xl border border-[#DFEAF0] bg-[#FAFBFD] p-3 ${className}`}
  >
    <span className="text-[11px] font-bold uppercase tracking-wide text-[#65778B]">
      Filter:
    </span>
    <label className="flex items-center gap-1.5">
      <Calendar className="h-3.5 w-3.5 text-[#1E4E8C]" />
      <span className="sr-only">Tahun anggaran</span>
      <select
        value={yearFilter}
        onChange={(event) => onYearChange(event.target.value)}
        className="rounded-lg border border-[#CCD9E4] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#35536F] focus:outline-none focus:ring-2 focus:ring-[#8FC5E7]"
      >
        <option value="">Semua Tahun ({totalCount})</option>
        {years.map((year) => (
          <option key={year} value={year}>
            Tahun {year}
          </option>
        ))}
      </select>
    </label>
    <label className="flex items-center gap-1.5">
      <Layers className="h-3.5 w-3.5 text-[#148B87]" />
      <span className="sr-only">Kategori bidang</span>
      <select
        value={categoryFilter}
        onChange={(event) => onCategoryChange(event.target.value)}
        className="max-w-[220px] rounded-lg border border-[#CCD9E4] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#35536F] focus:outline-none focus:ring-2 focus:ring-[#8FC5E7]"
      >
        <option value="">Semua Bidang</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </label>
    {(yearFilter || categoryFilter) && (
      <span className="rounded-md bg-[#E8F2F8] px-2 py-1 text-[11px] font-semibold text-[#1E4E8C]">
        Filter aktif
      </span>
    )}
    {showReset && (yearFilter || categoryFilter) && onReset && (
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-[#1E4E8C] hover:bg-[#E8F2F8]"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Reset
      </button>
    )}
  </div>
);
