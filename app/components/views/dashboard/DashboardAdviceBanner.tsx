"use client";

import React from "react";
import { User, AdviceRecord, Program } from "../../../types";
import { PageType } from "../../../types";

interface DashboardAdviceBannerProps {
  user: User;
  operatorAdvice: AdviceRecord[];
  pendingAdvice: AdviceRecord[];
  onNavigateToProfile: () => void;
}

export function DashboardAdviceBanner({
  user,
  operatorAdvice,
  pendingAdvice,
  onNavigateToProfile,
}: DashboardAdviceBannerProps) {
  return (
    <section className="bg-gradient-to-r from-[#FFFDFB] to-[#FEF6EE] rounded-2xl p-5 border border-[#FAD8B8] shadow-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#FFF0E2] text-[#E78A31] flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-[#143965]">
                Arahan & Evaluasi dari Pimpinan
              </h3>
              {pendingAdvice.length > 0 ? (
                <span className="badge belum bg-[#FFF0E2] text-[#E78A31] border border-[#FCDDC0] font-bold text-[11px]">
                  {pendingAdvice.length} Belum Ditindaklanjuti
                </span>
              ) : (
                <span className="badge selesai font-semibold text-[11px]">
                  Semua Telah Ditindaklanjuti
                </span>
              )}
            </div>
            <p className="text-xs text-[#65778B] mt-1 max-w-2xl leading-relaxed">
              {pendingAdvice.length > 0
                ? `Pimpinan (${pendingAdvice[0].identitasPimpinan}) memberikan arahan: "${pendingAdvice[0].isi.slice(0, 80)}${pendingAdvice[0].isi.length > 80 ? "..." : ""}". Buka menu Profil & Notifikasi untuk melihat detail instruksi.`
                : "Tidak ada arahan tertunda. Seluruh instruksi pimpinan telah ditindaklanjuti."}
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToProfile}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#1E4E8C] text-white hover:bg-[#143965] transition shadow-xs shrink-0"
        >
          Buka Profil & Notifikasi →
        </button>
      </div>
    </section>
  );
}
