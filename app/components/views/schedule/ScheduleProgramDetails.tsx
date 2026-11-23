"use client";

import React from "react";
import { Program } from "../../../types";

interface ScheduleProgramDetailsProps {
  program: Program;
}

export function ScheduleProgramDetails({ program }: ScheduleProgramDetailsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs pt-3 border-t border-[#F0F4F8]">
      <div className="py-1 border-b border-[#F0F4F8]">
        <span className="text-[#65778B]">Periode:</span>{" "}
        <strong className="text-[#143965] ml-1">Tahun {program.periode}</strong>
      </div>
      <div className="py-1 border-b border-[#F0F4F8]">
        <span className="text-[#65778B]">Waktu Pelaksanaan:</span>{" "}
        <strong className="text-[#143965] ml-1">
          {program.jadwal || "Sesuai periode"}
        </strong>
      </div>
      <div className="py-1 border-b border-[#F0F4F8]">
        <span className="text-[#65778B]">Penanggung Jawab:</span>{" "}
        <strong className="text-[#143965] ml-1">
          {program.operatorPengelola || "Belum Ditugaskan"}
        </strong>
      </div>
      <div className="py-1 border-b border-[#F0F4F8]">
        <span className="text-[#65778B]">Lokasi Rinci:</span>{" "}
        <strong className="text-[#143965] ml-1">{program.lokasi}</strong>
      </div>
      <div className="py-1 border-b border-[#F0F4F8]">
        <span className="text-[#65778B]">Penyedia CV/PT:</span>{" "}
        <strong className="text-[#143965] ml-1">{program.penyedia || "-"}</strong>
      </div>
      <div className="py-1 border-b border-[#F0F4F8]">
        <span className="text-[#65778B]">Nomor Kontrak / SPK:</span>{" "}
        <strong className="text-[#143965] ml-1">{program.noKontrak || "-"}</strong>
      </div>
    </div>
  );
}
