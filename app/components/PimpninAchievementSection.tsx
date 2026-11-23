"use client";

import React from "react";
import { Program } from "../types";

interface PimpninAchievementSectionProps {
  programs: Program[];
}

export function PimpninAchievementSection({
  programs,
}: PimpninAchievementSectionProps) {
  const totalPagu = programs.reduce((acc, p) => acc + Number(p.pagu || 0), 0);
  const totalPenggunaan = programs.reduce(
    (acc, p) => acc + Number(p.penggunaan || 0),
    0
  );
  const selesaiCount = programs.filter(
    (p) => p.status === "Selesai Dikerjakan"
  ).length;
  const sedangCount = programs.filter(
    (p) => p.status === "Sedang Dikerjakan"
  ).length;

  return (
    <section className="bg-white rounded-2xl p-6 border border-[#E1E9F0] shadow-xs">
      <h3 className="text-base font-bold text-[#143965] mb-1">
        Capaian Pimpnin
      </h3>
      <p className="text-xs text-[#65778B] mb-4">
        Ringkasan capaian target dan akumulasi anggaran seluruh kegiatan
        permukiman.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-[#E1E9F0] bg-[#FBFDFE]">
          <p className="text-xs text-[#65778B] m-0">Total Kegiatan</p>
          <strong className="block text-lg font-bold text-[#143965] mt-1">
            {programs.length}
          </strong>
        </div>
        <div className="p-4 rounded-xl border border-[#E1E9F0] bg-[#FBFDFE]">
          <p className="text-xs text-[#65778B] m-0">Sedang Dikerjakan</p>
          <strong className="block text-lg font-bold text-[#148B87] mt-1">
            {sedangCount}
          </strong>
        </div>
        <div className="p-4 rounded-xl border border-[#E1E9F0] bg-[#FBFDFE]">
          <p className="text-xs text-[#65778B] m-0">Selesai Dikerjakan</p>
          <strong className="block text-lg font-bold text-[#258050] mt-1">
            {selesaiCount}
          </strong>
        </div>
        <div className="p-4 rounded-xl border border-[#E1E9F0] bg-[#FBFDFE]">
          <p className="text-xs text-[#65778B] m-0">Realisasi Anggaran</p>
          <strong className="block text-lg font-bold text-[#E78A31] mt-1 truncate">
            {totalPenggunaan} / {totalPagu}
          </strong>
        </div>
      </div>
    </section>
  );
}
