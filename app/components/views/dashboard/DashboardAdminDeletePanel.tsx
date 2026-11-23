"use client";

import React from "react";
import { Program } from "../../../types";
import { currency } from "../../../utils/helpers";
import {
  getProgramDesa,
  getProgramKecamatan,
  getProgramYear,
} from "../../../utils/helpers";

interface DashboardAdminDeletePanelProps {
  adminFilteredPrograms: Program[];
  adminSearchTerm: string;
  setAdminSearchTerm: (v: string) => void;
  isDeleting: boolean;
  onDeleteProgram: (p: Program) => void;
  setConfirmDeleteProgram: (p: Program | null) => void;
}

export function DashboardAdminDeletePanel({
  adminFilteredPrograms,
  adminSearchTerm,
  setAdminSearchTerm,
  isDeleting,
  onDeleteProgram,
  setConfirmDeleteProgram,
}: DashboardAdminDeletePanelProps) {
  return (
    <section className="bg-white rounded-2xl p-6 border border-[#E1E9F0] shadow-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-[#EAF0F4]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FDEEED] text-[#BD493B] flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-[#143965]">
              Kuasa Hapus Data Kegiatan (Dashboard Admin)
            </h3>
            <p className="text-xs text-[#65778B] mt-0.5">
              Sebagai Admin, Anda dapat menyortir per kategori tahun dan menghapus
              kegiatan dinas langsung dari sini.
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <svg
            className="w-4 h-4 text-[#718296] absolute left-3 top-2.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={adminSearchTerm}
            onChange={(e) => setAdminSearchTerm(e.target.value)}
            placeholder="Cari kegiatan untuk dihapus..."
            className="pl-9 pr-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#8FC5E7] w-full"
          />
        </div>
      </div>

      <div className="overflow-x-auto border border-[#E3EBF0] rounded-xl max-h-80">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#F6F9FB] text-[#61738A] uppercase font-bold text-[11px] sticky top-0">
            <tr>
              <th className="p-3">Tahun / Kode</th>
              <th className="p-3">Nama Kegiatan</th>
              <th className="p-3">Kategori</th>
              <th className="p-3">Lokasi (Desa & Kec)</th>
              <th className="p-3">Pagu</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Aksi Hapus</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAF0F4]">
            {adminFilteredPrograms.length > 0 ? (
              adminFilteredPrograms.map((p) => (
                <tr key={p.id} className="hover:bg-[#FBFDFE]">
                  <td className="p-3 whitespace-nowrap">
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E8F2F8] text-[#1E4E8C] mr-1.5">
                      TA {getProgramYear(p)}
                    </span>
                    <span className="font-mono text-[#65778B]">{p.kode}</span>
                  </td>
                  <td className="p-3 font-bold text-[#143965]">{p.nama}</td>
                  <td className="p-3 text-[#496178]">
                    <span className="bg-[#EDF5FB] text-[#1E4E8C] px-2 py-0.5 rounded text-[11px] font-semibold">
                      {p.kategori}
                    </span>
                  </td>
                  <td className="p-3 text-[#65778B]">
                    {getProgramDesa(p)}, Kec. {getProgramKecamatan(p)}
                  </td>
                  <td className="p-3 font-semibold text-[#143965] whitespace-nowrap">
                    {currency(p.pagu)}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="badge belum text-[10px]">{p.status}</span>
                  </td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onDeleteProgram(p)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FDEEED] text-[#BD493B] hover:bg-[#F8C8C4] transition"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Hapus
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-8 text-[#65778B]">
                  Tidak ada kegiatan yang cocok untuk kategori yang dipilih.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
