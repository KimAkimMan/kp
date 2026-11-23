"use client";

import React from "react";
import { FieldSurvey, User } from "../../../types";
import { currency } from "../../../utils/helpers";
import { PageType } from "../../../types";

interface DashboardOperatorSurveySectionProps {
  user: User;
  surveys: FieldSurvey[];
  onNavigateToSurvey: () => void;
}

export function DashboardOperatorSurveySection({
  user,
  surveys,
  onNavigateToSurvey,
}: DashboardOperatorSurveySectionProps) {
  const rusakBeratCount = surveys.filter(
    (s) => s.kondisi === "Rusak Berat" || s.kondisi === "Rusak Sedang"
  ).length;
  const totalEstimasi = surveys.reduce(
    (acc, curr) => acc + (curr.estimasiBiaya || 0),
    0
  );

  return (
    <section className="bg-white rounded-2xl p-6 border border-[#E1E9F0] shadow-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 pb-4 border-b border-[#EAF0F4]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E8F2F8] text-[#1E4E8C] flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-[#143965]">
              Form Survey Lapangan Permukiman
            </h3>
            <p className="text-xs text-[#65778B] mt-0.5">
              Pendataan teknis kondisi fisik, verifikasi titik nol (0%), dan
              dokumentasi kerusakan infrastruktur permukiman.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={onNavigateToSurvey}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#1E4E8C] text-white hover:bg-[#143965] transition shadow-xs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Buka Form Survey
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="p-3.5 rounded-xl border border-[#DFEAF0] bg-[#FBFDFE]">
          <span className="text-[11px] text-[#65778B] font-semibold block">
            Total Data Survey
          </span>
          <strong className="text-lg font-bold text-[#143965] block mt-0.5">
            {surveys.length} Titik Lokasi
          </strong>
        </div>
        <div className="p-3.5 rounded-xl border border-[#DFEAF0] bg-[#FBFDFE]">
          <span className="text-[11px] text-[#65778B] font-semibold block">
            Kondisi Rusak Berat/Sedang
          </span>
          <strong className="text-lg font-bold text-[#BD493B] block mt-0.5">
            {rusakBeratCount} Lokasi
          </strong>
        </div>
        <div className="p-3.5 rounded-xl border border-[#DFEAF0] bg-[#FBFDFE]">
          <span className="text-[11px] text-[#65778B] font-semibold block">
            Estimasi Kebutuhan Usulan
          </span>
          <strong className="text-lg font-bold text-[#148B87] block mt-0.5 truncate">
            {currency(totalEstimasi)}
          </strong>
        </div>
      </div>

      {surveys.length > 0 ? (
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-[#35536F] uppercase tracking-wider">
              Hasil Survey Lapangan Terkini
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {surveys.slice(0, 3).map((srv) => {
              const badgeKondisi =
                srv.kondisi === "Baik"
                  ? "bg-[#E7F6ED] text-[#258050] border-[#C8E8D5]"
                  : srv.kondisi === "Rusak Ringan"
                  ? "bg-[#FEF7E9] text-[#B07300] border-[#FCE6BD]"
                  : srv.kondisi === "Rusak Sedang"
                  ? "bg-[#FFF3E8] text-[#BD6C1E] border-[#FCDDC0]"
                  : "bg-[#FDEEED] text-[#BD493B] border-[#F8C8C4]";

              return (
                <div
                  key={srv.id}
                  onClick={onNavigateToSurvey}
                  className="p-4 rounded-xl border border-[#E1E9F0] bg-[#FAFCFD] hover:border-[#A8C9DC] hover:shadow-xs transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeKondisi}`}
                      >
                        {srv.kondisi}
                      </span>
                      <span className="text-[11px] text-[#65778B] font-mono">
                        {srv.kodeSurvey}
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#143965] line-clamp-1 mb-1">
                      {srv.namaKegiatan}
                    </h4>
                    <p className="text-[11px] text-[#65778B] line-clamp-2 mb-2">
                      {srv.detailLokasi || `${srv.desaKelurahan}, Kec. ${srv.kecamatan}`}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-[#EAF0F4] flex items-center justify-between text-[11px]">
                    <span className="text-[#65778B]">{srv.tanggal}</span>
                    <span className="font-bold text-[#148B87]">
                      {srv.estimasiBiaya ? currency(srv.estimasiBiaya) : srv.kategori}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-6 border border-dashed border-[#CCD9E4] rounded-xl text-xs text-[#65778B]">
          Belum ada survey lapangan yang tercatat. Klik tombol di atas untuk mengisi
          formulir survey pertama.
        </div>
      )}
    </section>
  );
}
