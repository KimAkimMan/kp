"use client";

import React from "react";

interface SearchFilterProps {
  searchTerm: string;
  filterKecamatan: string;
  filterKondisi: string;
  kecamatanList: string[];
  kondisiList: string[];
  onSearchChange: (value: string) => void;
  onKecamatanChange: (value: string) => void;
  onKondisiChange: (value: string) => void;
}

export function SearchFilter({
  searchTerm,
  filterKecamatan,
  filterKondisi,
  kecamatanList,
  kondisiList,
  onSearchChange,
  onKecamatanChange,
  onKondisiChange,
}: SearchFilterProps) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E1E9F0] shadow-xs">
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-[#65778B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama kegiatan, desa, kode survey, surveyor..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#CCD9E4] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1E4E8C]/20"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Kecamatan
            </label>
            <select
              value={filterKecamatan}
              onChange={(e) => onKecamatanChange(e.target.value)}
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1E4E8C]/20"
            >
              <option value="">Semua Kecamatan</option>
              {kecamatanList.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Kondisi
            </label>
            <select
              value={filterKondisi}
              onChange={(e) => onKondisiChange(e.target.value)}
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1E4E8C]/20"
            >
              <option value="">Semua Kondisi</option>
              {kondisiList.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Search } from "lucide-react";
