"use client";

import React from "react";
import { Program, PageType } from "../../../types";
import {
  getProgramDesa,
  getProgramKecamatan,
  getProgramYear,
  quantity,
} from "../../../utils/helpers";

interface DashboardProgramListProps {
  filteredPrograms: Program[];
  yearFilter: string;
  categoryFilter: string;
  totalCount: number;
  onYearChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onSelectProgram: (id: number) => void;
  isAdmin: boolean;
  onDeleteProgram: (p: Program) => void;
  onNavigateToPrograms: () => void;
}

export function DashboardProgramList({
  filteredPrograms,
  yearFilter,
  categoryFilter,
  totalCount,
  onYearChange,
  onCategoryChange,
  onSelectProgram,
  isAdmin,
  onDeleteProgram,
  onNavigateToPrograms,
}: DashboardProgramListProps) {
  return (
    <section className="bg-white rounded-2xl p-6 border border-[#E1E9F0] shadow-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h3 className="text-base font-bold text-[#143965]">Kegiatan Terkini</h3>
          <p className="text-xs text-[#65778B] mt-0.5">
            Pilih kategori tahun untuk melihat kegiatan spesifik tahun tersebut.
          </p>
        </div>
        <button
          onClick={onNavigateToPrograms}
          className="text-xs font-bold text-[#1E4E8C] hover:underline"
        >
          Lihat Semua Kegiatan →
        </button>
      </div>

      <ActivityFiltersInline
        years={[]}
        categories={[]}
        yearFilter={yearFilter}
        categoryFilter={categoryFilter}
        totalCount={totalCount}
        onYearChange={onYearChange}
        onCategoryChange={onCategoryChange}
        className="mb-4"
      />

      {filteredPrograms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredPrograms.slice(0, 3).map((p) => {
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
              <div
                key={p.id}
                onClick={() => onSelectProgram(p.id)}
                className="bg-[#FBFDFE] border border-[#E1E9F0] rounded-2xl p-5 hover:border-[#A8C9DC] hover:-translate-y-1 transition duration-200 shadow-xs cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E8F2F8] text-[#1E4E8C]">
                        TA {yearDisplay}
                      </span>
                      <span className={`badge ${badgeClass}`}>{p.status}</span>
                    </div>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProgram(p);
                        }}
                        className="p-1 rounded-lg text-[#BD493B] hover:bg-[#FDEEED] transition"
                        title="Hapus kegiatan ini"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                  <span className="text-[11px] text-[#65778B] font-mono">{p.kode}</span>
                  <h4 className="text-sm font-bold text-[#143965] mb-1.5 leading-snug">
                    {p.nama}
                  </h4>
                  <p className="text-xs text-[#65778B] line-clamp-1 mb-1">
                    <span className="font-semibold text-[#143965]">{desaDisplay}</span>,
                    Kec. {kecamatanDisplay}
                  </p>
                </div>
                <div className="pt-2.5 border-t border-[#EAEFF4] text-xs">
                  <span className="text-[#65778B]">
                    Target:{" "}
                    <strong className="text-[#143965]">
                      {quantity(p.target, p.satuan)}
                    </strong>
                  </span>
                  <span className="block text-[#148B87] font-semibold mt-0.5">
                    Realisasi: {quantity(p.realisasi, p.satuan)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-[#65778B] border border-dashed border-[#CCD9E4] rounded-xl text-xs">
          Tidak ada kegiatan pada kategori yang dipilih.
        </div>
      )}
    </section>
  );
}

interface ActivityFiltersInlineProps {
  years: string[];
  categories: string[];
  yearFilter: string;
  categoryFilter: string;
  totalCount: number;
  onYearChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  className?: string;
}

function ActivityFiltersInline({
  years,
  categories,
  yearFilter,
  categoryFilter,
  totalCount,
  onYearChange,
  onCategoryChange,
  className,
}: ActivityFiltersInlineProps) {
  return (
    <div className={`overflow-x-auto border border-[#E3EBF0] rounded-xl p-2 ${className || ""}`}>
      <div className="flex flex-wrap gap-3">
        <label className="text-[10px] font-bold text-[#35536F] uppercase tracking-wider mb-1 block">
          Tahun Anggaran
        </label>
        <select
          value={yearFilter}
          onChange={(e) => onYearChange(e.target.value)}
          className="border border-[#CCD9E4] rounded-xl px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1E4E8C]/20 min-w-[120px]"
        >
          <option value="">Semua Tahun</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <label className="text-[10px] font-bold text-[#35536F] uppercase tracking-wider mb-1 block">
          Kategori
        </label>
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="border border-[#CCD9E4] rounded-xl px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1E4E8C]/20 min-w-[160px]"
        >
          <option value="">Semua Kategori</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <span className="text-[11px] text-[#65778B] font-semibold ml-auto self-center">
          {totalCount} kegiatan
        </span>
      </div>
    </div>
  );
}
