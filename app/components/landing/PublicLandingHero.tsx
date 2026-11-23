"use client";

import React from "react";
import { HERO_STATIC_FALLBACKS } from "./PublicLandingHeroData";

interface PublicLandingHeroProps {
  heroIndex: number;
  setHeroIndex: (v: number) => void;
}

export function PublicLandingHero({
  heroIndex,
  setHeroIndex,
}: PublicLandingHeroProps) {
  const heroSlides = HERO_STATIC_FALLBACKS;

  if (heroSlides.length === 0) {
    return (
      <section className="relative text-white overflow-hidden" style={{ minHeight: "420px" }}>
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to right, rgba(14,38,70,0.82) 0%, rgba(14,38,70,0.60) 55%, rgba(14,38,70,0.25) 100%)",
        }} />
        <div className="relative z-10 px-[7%] py-20 md:py-24 max-w-3xl mx-auto text-center">
          <span className="inline-block text-xs font-bold tracking-widest text-[#BFE3E1] uppercase mb-3">
            SIPANTAU — SISTEM INFORMASI PENYIMPANAN DATA DAN PEMANTAUAN KEGIATAN PSU
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight text-white mb-4">
            Data Tersimpan, Progres Terpantau.
          </h1>
          <p className="text-base sm:text-lg text-[#E0EDF7] leading-relaxed max-w-2xl mx-auto">
            Dokumentasi kegiatan PSU akan ditampilkan di sini setelah survey diunggah dan program selesai dikerjakan.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative text-white overflow-hidden" style={{ minHeight: "420px" }}>
      {heroSlides.map((slide, i) => (
        <div
          key={i}
          aria-hidden={i !== heroIndex}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === heroIndex ? 1 : 0 }}
        >
          <img
            src={slide.src}
            alt={slide.alt}
            className="w-full h-full object-cover"
            style={{ minHeight: "420px" }}
            loading={i === 0 ? "eager" : "lazy"}
          />
        </div>
      ))}

      <div className="absolute inset-0" style={{
        background: "linear-gradient(to right, rgba(14,38,70,0.82) 0%, rgba(14,38,70,0.60) 55%, rgba(14,38,70,0.25) 100%)",
      }} />

      <div className="relative z-10 px-[7%] py-16 md:py-20 max-w-3xl">
        <span className="inline-block text-xs font-bold tracking-widest text-[#BFE3E1] uppercase mb-3">
          SIPANTAU — SISTEM INFORMASI PENYIMPANAN DATA DAN PEMANTAUAN KEGIATAN PSU
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-white mb-4">
          Data Tersimpan, Progres Terpantau.
        </h1>
        <p className="text-base sm:text-lg text-[#E0EDF7] leading-relaxed max-w-2xl">
          Sistem Informasi Penyimpanan Data dan Pemantauan Kegiatan PSU Kabupaten Kuningan.
          Pantau kegiatan, target, realisasi, dokumentasi, dan penggunaan anggaran secara terbuka, akuntabel, dan terukur.
        </p>
      </div>

      <div className="absolute bottom-4 left-[7%] z-10">
        <span className="text-[11px] text-white/70 bg-black/30 px-2.5 py-1 rounded-full backdrop-blur-sm">
          {heroSlides[heroIndex].caption}
        </span>
      </div>

      <div className="absolute bottom-4 right-[7%] z-10 flex items-center gap-2">
        {heroSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => setHeroIndex(i)}
            aria-label={`Slide ${i + 1}`}
            className="transition-all duration-300 rounded-full"
            style={{
              width: i === heroIndex ? "24px" : "8px",
              height: "8px",
              background: i === heroIndex ? "#fff" : "rgba(255,255,255,0.4)",
            }}
          />
        ))}
      </div>
    </section>
  );
}
