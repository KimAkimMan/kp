"use client";

import React from "react";
import { SimpleBarChart } from "../../Charts";
import { currency } from "../../../utils/helpers";

interface DashboardBudgetSectionProps {
  summary: Record<string, unknown>;
}

const num = (obj: Record<string, unknown>, key: string): number =>
  Number(obj[key]) || 0;

export function DashboardBudgetSection({
  summary,
}: DashboardBudgetSectionProps) {
  const pagu = num(summary, "pagu");
  const penggunaan = num(summary, "penggunaan");
  const sisaAnggaran = num(summary, "sisaAnggaran");
  const berpagu = num(summary, "berpagu");
  const tanpaPagu = num(summary, "tanpaPagu");

  return (
    <section className="bg-white rounded-2xl p-6 border border-[#E1E9F0] shadow-xs">
      <h3 className="text-base font-bold text-[#143965] mb-1">
        Akumulasi Anggaran dan Pagu
      </h3>
      <p className="text-xs text-[#65778B] mb-5">
        Pagu, penggunaan, dan sisa anggaran diperbarui secara otomatis dari
        kegiatan dinas.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <div className="p-3.5 rounded-xl border border-[#DFEAF0] bg-[#FBFDFE]">
          <p className="text-xs text-[#65778B] m-0">Pagu Total</p>
          <strong className="block text-base sm:text-lg font-bold text-[#143965] mt-1 truncate">
            {currency(pagu)}
          </strong>
        </div>
        <div className="p-3.5 rounded-xl border border-[#DFEAF0] bg-[#FBFDFE]">
          <p className="text-xs text-[#65778B] m-0">Total Penggunaan</p>
          <strong className="block text-base sm:text-lg font-bold text-[#148B87] mt-1 truncate">
            {currency(penggunaan)}
          </strong>
        </div>
        <div className="p-3.5 rounded-xl border border-[#DFEAF0] bg-[#FBFDFE]">
          <p className="text-xs text-[#65778B] m-0">Sisa Anggaran</p>
          <strong className="block text-base sm:text-lg font-bold text-[#E78A31] mt-1 truncate">
            {currency(sisaAnggaran)}
          </strong>
        </div>
        <div className="p-3.5 rounded-xl border border-[#DFEAF0] bg-[#FBFDFE]">
          <p className="text-xs text-[#65778B] m-0">Kegiatan Beranggaran</p>
          <strong className="block text-base sm:text-lg font-bold text-[#143965] mt-1">
            {berpagu}
          </strong>
        </div>
        <div className="p-3.5 rounded-xl border border-[#DFEAF0] bg-[#FBFDFE]">
          <p className="text-xs text-[#65778B] m-0">Belum Memiliki Pagu</p>
          <strong className="block text-base sm:text-lg font-bold text-[#143965] mt-1">
            {tanpaPagu}
          </strong>
        </div>
      </div>

      {pagu > 0 ? (
        <div>
          <SimpleBarChart
            labels={["Akumulasi Anggaran"]}
            datasets={[
              {
                label: "Pagu Total",
                data: [pagu],
                backgroundColor: "#1E4E8C",
              },
              {
                label: "Penggunaan",
                data: [penggunaan],
                backgroundColor: "#148B87",
              },
              {
                label: "Sisa Anggaran",
                data: [sisaAnggaran],
                backgroundColor: "#E78A31",
              },
            ]}
            formatValue={(v: number) => currency(v)}
            height={220}
          />
          <p className="text-[11px] text-[#65778B] mt-3">
            Legenda: Pagu Total (biru tua) · Penggunaan (teal) · Sisa Anggaran
            (oranye).
          </p>
        </div>
      ) : (
        <div className="text-center py-8 text-[#65778B] border border-dashed border-[#CCD9E4] rounded-xl text-xs">
          Belum ada nilai anggaran yang terdaftar.
        </div>
      )}
    </section>
  );
}
