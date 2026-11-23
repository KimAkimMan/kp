"use client";

import React from "react";

interface PublicLandingDocumentationProps {
  documentationCards: Array<{
    key: string | number;
    src: string;
    alt: string;
    title: string;
    location: string;
    year: string;
    status: string;
    badgeClass: string;
    onClick: (() => void) | undefined;
  }>;
}

export function PublicLandingDocumentation({
  documentationCards,
}: PublicLandingDocumentationProps) {
  return (
    <section id="dokumentasi" className="bg-[#EDF4F8] px-[5%] py-16">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <span className="text-xs font-bold tracking-widest text-[#148B87] uppercase">
            DOKUMENTASI LAPANGAN
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#143965] mt-1 mb-2">
            Dokumentasi Kegiatan
          </h2>
          <p className="text-[#65778B] text-sm sm:text-base max-w-2xl">
            Dokumentasi lapangan sebagai bagian dari transparansi pembangunan
            dan pemantauan kegiatan dinas di setiap wilayah.
          </p>
        </div>

        {documentationCards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {documentationCards.map((card) => (
              <article
                key={card.key}
                onClick={card.onClick}
                className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E1E9F0] hover:shadow-md transition flex flex-col ${
                  card.onClick ? "cursor-pointer" : ""
                }`}
              >
                <img
                  src={card.src}
                  alt={card.alt}
                  className="w-full h-52 object-cover"
                  loading="lazy"
                />
                <div className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E8F2F8] text-[#1E4E8C]">
                      TA {card.year}
                    </span>
                    <span className={`badge ${card.badgeClass}`}>{card.status}</span>
                  </div>
                  <strong className="block text-sm font-bold text-[#143965] mt-2">
                    {card.title}
                  </strong>
                  <span className="block text-xs text-[#65778B] mt-1">
                    {card.location}
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#CCD9E4]">
            <span className="text-xs font-bold tracking-widest text-[#65778B] uppercase mb-2">
              Belum ada dokumentasi
            </span>
            <p className="text-[#65778B] text-sm">
              Dokumentasi kegiatan akan ditampilkan di sini setelah survey diunggah
              dan program selesai dikerjakan.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
