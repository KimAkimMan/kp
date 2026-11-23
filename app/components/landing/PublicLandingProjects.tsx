"use client";

import React from "react";
import { Program } from "../../types";
import { getProgramDesa, getProgramKecamatan, getProgramYear, quantity } from "../../utils/helpers";
import { ActivityFilters } from "../views/ActivityFilters";

interface PublicLandingProjectsProps {
  filteredProjects: Program[];
  availableYears: string[];
  availableCategories: string[];
  yearFilter: string;
  categoryFilter: string;
  onYearChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onReset: () => void;
  onSelectProgram: (id: number) => void;
}

export function PublicLandingProjects({
  filteredProjects,
  availableYears,
  availableCategories,
  yearFilter,
  categoryFilter,
  onYearChange,
  onCategoryChange,
  onReset,
  onSelectProgram,
}: PublicLandingProjectsProps) {
  const badgeClass = (status: string) =>
    status === "Belum Dikerjakan"
      ? "belum"
      : status === "Sedang Dikerjakan"
      ? "sedang"
      : "selesai";

  return (
    <section id="proyek" className="px-[5%] py-16 max-w-7xl mx-auto">
      <div className="mb-6">
        <span className="text-xs font-bold tracking-widest text-[#148B87] uppercase">
          TRANSPARANSI PELAKSANAAN
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#143965] mt-1 mb-2">
          Proyek Pembangunan Permukiman
        </h2>
        <p className="text-[#65778B] text-sm sm:text-base max-w-2xl">
          Pilih kategori tahun untuk menyortir dan melihat kegiatan prioritas yang terdaftar pada tahun anggaran tersebut.
        </p>
      </div>

      <div className="flex items-start justify-between gap-4 mb-8">
        <ActivityFilters
          years={availableYears}
          categories={availableCategories}
          yearFilter={yearFilter}
          categoryFilter={categoryFilter}
          totalCount={filteredProjects.length}
          onYearChange={onYearChange}
          onCategoryChange={onCategoryChange}
          onReset={onReset}
          showReset
          className="mb-8 bg-white"
        />
      </div>

      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {filteredProjects.map((p) => {
            const bc = badgeClass(p.status);
            const desaDisplay = getProgramDesa(p);
            const kecamatanDisplay = getProgramKecamatan(p);
            const yearDisplay = getProgramYear(p);

            return (
              <div
                key={p.id}
                onClick={() => onSelectProgram(p.id)}
                className="bg-white border border-[#E1E9F0] rounded-2xl p-5 hover:border-[#A8C9DC] hover:-translate-y-1 transition duration-200 shadow-sm cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E8F2F8] text-[#1E4E8C]">
                        TA {yearDisplay}
                      </span>
                      <span className={`badge ${bc}`}>{p.status}</span>
                    </div>
                    <span className="text-xs text-[#65778B] font-mono">
                      {p.kode}
                    </span>
                  </div>
                  <span className="inline-block bg-[#EDF5FB] text-[#1E4E8C] px-2 py-0.5 rounded text-[10px] font-semibold mb-2">
                    {p.kategori}
                  </span>
                  <h3 className="text-base font-bold text-[#143965] mb-2 leading-snug">
                    {p.nama}
                  </h3>
                  <p className="text-xs text-[#65778B] mb-3">
                    <strong className="text-[#143965]">{desaDisplay}</strong>, Kec. {kecamatanDisplay}
                  </p>
                </div>
                <div className="pt-3 border-t border-[#F0F4F8] text-xs sm:text-sm">
                  <span className="text-[#65778B]">
                    Target:{" "}
                    <strong className="text-[#143965]">
                      {quantity(p.target, p.satuan)}
                    </strong>
                  </span>
                  <span className="block text-[#148B87] mt-0.5 font-medium">
                    Realisasi: {quantity(p.realisasi, p.satuan)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-[#CCD9E4] text-[#65778B] text-sm">
          Tidak ada proyek yang sesuai dengan kategori tahun yang dipilih.
        </div>
      )}
      </section>
    );
  }
