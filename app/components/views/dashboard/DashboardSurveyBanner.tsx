"use client";

import React from "react";
import { FieldSurvey } from "../../../types";
import { currency } from "../../../utils/helpers";

interface DashboardSurveyBannerProps {
  surveys: FieldSurvey[];
  onNavigateToAdminSurvey: () => void;
  onDeleteSurvey: (id: string) => void;
  setConfirmDeleteSurveyId: (id: string | null) => void;
  isDeleting: boolean;
}

export function DashboardSurveyBanner({
  surveys,
  onNavigateToAdminSurvey,
  onDeleteSurvey,
  setConfirmDeleteSurveyId,
  isDeleting,
}: DashboardSurveyBannerProps) {
  const unconverted = surveys.filter((s) => !s.programId);

  return (
    <section className="bg-white rounded-2xl p-6 border border-[#E1E9F0] shadow-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-[#EAF0F4]">
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
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-[#143965]">Hasil Survey Lapangan Operator</h3>
              <span className="badge belum bg-[#FFF0E2] text-[#E78A31] border border-[#FCDDC0] font-bold text-[11px]">
                {unconverted.length} Belum Jadi Kegiatan
              </span>
            </div>
            <p className="text-xs text-[#65778B] mt-0.5">
              Tinjau usulan hasil survey operator, konversi jadi kegiatan resmi, atau hapus
              data survey yang tidak valid.
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToAdminSurvey}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#1E4E8C] text-white hover:bg-[#143965] transition shadow-xs shrink-0"
        >
          Buka Hasil Survey Operator →
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {surveys.slice(0, 3).map((srv) => (
          <div
            key={srv.id}
            onClick={onNavigateToAdminSurvey}
            className="p-3.5 rounded-xl border border-[#E1E9F0] bg-[#FAFBFD] hover:border-[#1E4E8C]/30 hover:shadow-xs transition cursor-pointer relative group"
          >
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-mono text-[#65778B]">{srv.kodeSurvey}</span>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[#1E4E8C]">{srv.kategori}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDeleteSurveyId(srv.id);
                  }}
                  className="p-1 rounded text-[#BD493B] hover:bg-[#FDEEED] transition"
                  title="Hapus survey ini"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <h4 className="text-xs font-bold text-[#143965] line-clamp-1">{srv.namaKegiatan}</h4>
            <p className="text-[11px] text-[#65778B] mt-0.5 line-clamp-1">
              {srv.desaKelurahan}, Kec. {srv.kecamatan}
            </p>
            <div className="mt-2 pt-2 border-t border-[#EAF0F4] flex items-center justify-between text-[11px]">
              <span className="text-[#65778B]">Oleh: {srv.surveyor}</span>
              <span className="font-bold text-[#148B87]">
                {srv.estimasiBiaya ? currency(srv.estimasiBiaya) : "—"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
