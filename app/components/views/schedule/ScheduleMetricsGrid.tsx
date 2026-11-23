"use client";

import React from "react";
import { Program } from "../../../types";
import { quantity, remTarget } from "../../../utils/helpers";

interface ScheduleMetricsGridProps {
  program: Program;
}

export function ScheduleMetricsGrid({ program }: ScheduleMetricsGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
      <div className="p-3.5 rounded-xl border border-[#DFEAF0] bg-[#FBFDFE]">
        <p className="text-[11px] text-[#65778B] m-0 font-medium">
          Target Awal
        </p>
        <strong className="block text-sm sm:text-base font-bold text-[#143965] mt-1">
          {quantity(program.targetAwal, program.satuan)}
        </strong>
      </div>
      <div className="p-3.5 rounded-xl border border-[#DFEAF0] bg-[#FBFDFE]">
        <p className="text-[11px] text-[#65778B] m-0 font-medium">
          Target Berjalan
        </p>
        <strong className="block text-sm sm:text-base font-bold text-[#143965] mt-1">
          {quantity(program.target, program.satuan)}
        </strong>
      </div>
      <div className="p-3.5 rounded-xl border border-[#DFEAF0] bg-[#FBFDFE]">
        <p className="text-[11px] text-[#65778B] m-0 font-medium">
          Realisasi Terakhir
        </p>
        <strong className="block text-sm sm:text-base font-bold text-[#148B87] mt-1">
          {quantity(program.realisasi, program.satuan)}
        </strong>
      </div>
      <div className="p-3.5 rounded-xl border border-[#DFEAF0] bg-[#FBFDFE]">
        <p className="text-[11px] text-[#65778B] m-0 font-medium">
          Sisa Target
        </p>
        <strong className="block text-sm sm:text-base font-bold text-[#E78A31] mt-1">
          {quantity(remTarget(program), program.satuan)}
        </strong>
      </div>
      <div className="p-3.5 rounded-xl border border-[#DFEAF0] bg-[#FBFDFE] col-span-2 sm:col-span-1">
        <p className="text-[11px] text-[#65778B] m-0 font-medium">
          Update Terakhir
        </p>
        <strong className="block text-xs font-semibold text-[#143965] mt-1 truncate">
          {program.update}
        </strong>
      </div>
    </div>
  );
}
