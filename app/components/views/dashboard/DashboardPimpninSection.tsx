"use client";

import React from "react";
import { Program, AdviceRecord } from "../../../types";
import { PimpninAchievementSection } from "../../PimpninAchievementSection";

interface DashboardPimpninSectionProps {
  programs: Program[];
  adviceRecords: AdviceRecord[];
}

export function DashboardPimpninSection({
  programs,
  adviceRecords,
}: DashboardPimpninSectionProps) {
  return (
    <>
      {programs.length > 0 && <PimpninAchievementSection programs={programs} />}

      <section
        id="kotak-saran"
        className="bg-white rounded-2xl p-6 border border-[#E1E9F0] shadow-xs scroll-mt-6"
      >
        <h3 className="text-base font-bold text-[#143965] mb-1">
          Saran dan Arahan Pimpnin
        </h3>
        <p className="text-xs text-[#65778B] mb-4">
          Sampaikan arahan kepada Operator berdasarkan kegiatan yang tersedia
          untuk ditindaklanjuti di lapangan.
        </p>

        <form className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#1E4E8C]/20"
            >
              <option value="">-- Pilih kegiatan --</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama}
                </option>
              ))}
            </select>

            <input
              type="text"
              defaultValue=""
              readOnly
              placeholder="Pilih kegiatan terlebih dahulu"
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-xs bg-[#F6F9FB] text-[#65778B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Isi Saran / Arahan
            </label>
            <textarea
              defaultValue=""
              rows={3}
              placeholder="Tuliskan saran perbaikan, arahan percepatan, atau evaluasi..."
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#1E4E8C] text-white hover:bg-[#143965] transition shadow-xs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3m2 10H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v16l-7-3z"
              />
            </svg>
            Simpan Saran
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#EAF0F4]">
          <h4 className="text-sm font-bold text-[#143965] mb-3">
            Riwayat Arahan Tersimpan ({adviceRecords.length})
          </h4>
          {adviceRecords.length > 0 ? (
            <div className="overflow-x-auto border border-[#E3EBF0] rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F6F9FB] text-[#61738A] uppercase font-bold text-[11px]">
                  <tr>
                    <th className="p-3">Kegiatan</th>
                    <th className="p-3">Operator</th>
                    <th className="p-3">Saran / Arahan</th>
                    <th className="p-3">Tanggal</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAF0F4]">
                  {[...adviceRecords]
                    .reverse()
                    .map((r) => (
                      <tr key={r.id} className="hover:bg-[#FBFDFE]">
                        <td className="p-3 font-semibold text-[#143965]">
                          {r.namaKegiatan}
                        </td>
                        <td className="p-3 text-[#65778B]">
                          {r.operatorPenerima}
                        </td>
                        <td className="p-3 text-[#18304B]">{r.isi}</td>
                        <td className="p-3 text-[#65778B] whitespace-nowrap">
                          {r.tanggal}
                        </td>
                        <td className="p-3">
                          <span className={`badge ${r.status === "Sudah ditindaklanjuti" ? "selesai" : "belum"}`}>
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-[#65778B] border border-dashed border-[#CCD9E4] rounded-xl text-xs">
              Belum ada saran dan arahan tersimpan.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
