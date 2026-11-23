"use client";

import React from "react";
import { currency } from "../../utils/helpers";

interface PublicLandingStatsProps {
  activeCount: number;
  doneCount: number;
  summary: { pagu: number; penggunaan: number };
  paguBelumDitetapkan: boolean;
}

export function PublicLandingStats({
  activeCount,
  doneCount,
  summary,
  paguBelumDitetapkan,
}: PublicLandingStatsProps) {
  return (
    <section className="px-[5%] -mt-10 sm:-mt-12 relative z-10 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <article className="bg-white rounded-2xl p-5 border border-[#E1E9F0] shadow-sm border-t-4 border-t-[#1E4E8C]">
          <p className="text-sm text-[#65778B] font-medium m-0">Program aktif</p>
          <strong className="block text-2xl sm:text-3xl font-bold text-[#143965] mt-2">
            {activeCount} Kegiatan
          </strong>
        </article>
        <article className="bg-white rounded-2xl p-5 border border-[#E1E9F0] shadow-sm border-t-4 border-t-[#148B87]">
          <p className="text-sm text-[#65778B] font-medium m-0">Program selesai</p>
          <strong className="block text-2xl sm:text-3xl font-bold text-[#148B87] mt-2">
            {doneCount} Kegiatan
          </strong>
        </article>
        <article className="bg-white rounded-2xl p-5 border border-[#E1E9F0] shadow-sm border-t-4 border-t-[#E78A31]">
          <p className="text-sm text-[#65778B] font-medium m-0">Total pagu</p>
          <strong className="block text-xl sm:text-2xl font-bold text-[#143965] mt-2">
            {paguBelumDitetapkan ? "Belum ditetapkan" : currency(summary.pagu)}
          </strong>
        </article>
        <article className="bg-white rounded-2xl p-5 border border-[#E1E9F0] shadow-sm border-t-4 border-t-[#258050]">
          <p className="text-sm text-[#65778B] font-medium m-0">Total penggunaan</p>
          <strong className="block text-xl sm:text-2xl font-bold text-[#258050] mt-2">
            {currency(summary.penggunaan)}
          </strong>
        </article>
      </div>
    </section>
  );
}
