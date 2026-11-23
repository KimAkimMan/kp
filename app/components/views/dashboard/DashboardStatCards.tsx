"use client";

import React from "react";
import { Program } from "../../../types";
import { currency } from "../../../utils/helpers";

interface DashboardStatCardProps {
  label: string;
  value: React.ReactNode;
  subLabel: string;
  color: "blue" | "teal" | "green" | "orange";
}

const COLOR_CLASSES: Record<string, string> = {
  blue: "bg-[#E8F2F8] text-[#1E4E8C]",
  teal: "bg-[#E7F6ED] text-[#148B87]",
  green: "bg-[#E7F6ED] text-[#258050]",
  orange: "bg-[#FFF7EE] text-[#E78A31]",
};

export function DashboardStatCard({
  label,
  value,
  subLabel,
  color = "blue",
}: DashboardStatCardProps) {
  return (
    <article className="bg-white rounded-2xl p-5 border border-[#E1E9F0] shadow-xs card-indicator">
      <p className="text-xs font-semibold text-[#65778B] m-0">{label}</p>
      <strong className={`block text-2xl font-bold mt-1.5 ${COLOR_CLASSES[color]}`}>
        {value}
      </strong>
      <span className="text-[11px] text-[#65778B] block mt-1">{subLabel}</span>
    </article>
  );
}

interface DashboardStatCardsProps {
  displayPrograms: Program[];
  summary: Record<string, unknown>;
  activeCount: number;
  doneCount: number;
}

export function DashboardStatCards({
  displayPrograms,
  summary,
  activeCount,
  doneCount,
}: DashboardStatCardsProps) {
  const sisaAnggaran = (summary.sisaAnggaran as number) || 0;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <DashboardStatCard
        label="Jumlah Kegiatan"
        value={displayPrograms.length}
        subLabel="Data keseluruhan dinas"
        color="blue"
      />
      <DashboardStatCard
        label="Sedang Dikerjakan"
        value={activeCount}
        subLabel="Dalam pengerjaan"
        color="teal"
      />
      <DashboardStatCard
        label="Selesai Dikerjakan"
        value={doneCount}
        subLabel="Telah tercapai 100%"
        color="green"
      />
      <DashboardStatCard
        label="Sisa Anggaran"
        value={currency(sisaAnggaran)}
        subLabel="Dari seluruh pagu"
        color="orange"
      />
    </div>
  );
}
