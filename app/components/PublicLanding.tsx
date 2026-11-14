/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Landmark, ExternalLink, RefreshCw } from "lucide-react";
import { programApi, type PublicProgram } from "@/lib/api";
import { Program } from "../types";
import {
  calculateSummary,
  statusCount,
  currency,
  quantity,
  getProgramYear,
  getProgramDesa,
  getProgramKecamatan,
} from "../utils/helpers";
import { LeafletMap } from "./LeafletMap";
import { PimpinanAchievementSection } from "./PimpinanAchievementSection";
import { ActivityFilters } from "./views/ActivityFilters";

interface PublicLandingProps {
  onOpenLogin: () => void;
  onSelectProgram: (id: number) => void;
}

export const PublicLanding: React.FC<PublicLandingProps> = ({
  onOpenLogin,
  onSelectProgram,
}) => {
  const [landingYearFilter, setLandingYearFilter] = useState("");
  const [landingCategoryFilter, setLandingCategoryFilter] = useState("");
  const [programs, setPrograms] = useState<PublicProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Hero slideshow
  const heroSlides = [
    {
      src: "/dokumentasi/hero-jalan-ancaran.jpg",
      alt: "Pembangunan jalan lingkungan di Ancaran, Kecamatan Kuningan",
      caption: "Jalan Lingkungan — Ancaran, Kec. Kuningan",
    },
    {
      src: "/dokumentasi/hero-jalan-ciporang.jpg",
      alt: "Jalan lingkungan Ciporang, Kecamatan Sindangagung",
      caption: "Jalan Lingkungan — Ciporang, Kec. Sindangagung",
    },
    {
      src: "/dokumentasi/jalan-lingkungan.jpg",
      alt: "Pembangunan jalan lingkungan Kabupaten Kuningan",
      caption: "Jalan Lingkungan — Kec. Kuningan",
    },
    {
      src: "/dokumentasi/drainase-tpt.jpg",
      alt: "Pembangunan drainase permukiman Kabupaten Kuningan",
      caption: "Drainase / TPT — Kec. Kuningan",
    },
    {
      src: "/dokumentasi/konstruksi-lainnya.jpg",
      alt: "Konstruksi tembok penahan tanah Kabupaten Kuningan",
      caption: "Konstruksi Lainnya — Kec. Kuningan",
    },
  ];
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((i) => (i + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Use direct fetch with proper error handling for modular setup
      // If API is not yet ready, this will fail gracefully
      const res = await programApi.public();
      setPrograms(res.data ?? []);
    } catch (err: unknown) {
      // Only set error if it's not a fetch/environment issue
      // during modular refactoring phase
      setError("Gagal memuat data kegiatan dari server.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchPrograms();
    };

    load();
    const interval = setInterval(fetchPrograms, 30000);
    return () => clearInterval(interval);
  }, [fetchPrograms, refreshKey]);

  const triggerRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  // Map PublicProgram (API enum status) → Program (display label status) for helpers
  const toProgram = (p: PublicProgram): Program => ({
    id: p.id,
    kode: p.kode,
    nama: p.nama,
    namaKegiatan: p.nama,
    kategori: p.kategori,
    lokasi: p.lokasi,
    kecamatan: p.kecamatan ?? "",
    desaKelurahan: p.desaKelurahan ?? "",
    detailLokasi: p.detailLokasi ?? "",
    pj: p.operatorPengelola ?? "Belum Ditugaskan",
    operatorPengelola: p.operatorPengelola ?? null,
    operatorPengelolaId: p.operatorPengelolaId ?? null,
    penanggungJawabDinas: null,
    periode: "2026",
    satuan: p.satuan,
    targetAwal: p.target,
    target: p.target,
    targetVolume: p.target,
    realisasi: p.realisasi,
    realisasiVolume: p.realisasi,
    status: (() => {
      switch (p.status) {
        case "SELESAI_DIKERJAKAN":
          return "Selesai Dikerjakan";
        case "SEDANG_DIKERJAKAN":
          return "Sedang Dikerjakan";
        default:
          return "Belum Dikerjakan";
      }
    })(),
    update: p.updatedAt,
    sumber: "Dokumentasi Transparansi",
    catatan: "",
    pagu: Number(p.pagu) || 0,
    penggunaan: Number(p.penggunaan) || 0,
    penggunaanBiaya: Number(p.penggunaan) || 0,
    histories: [],
    costs: [],
  });

  const displayPrograms = programs.map(toProgram);

  const availableYears = Array.from(
    new Set([
      "2026",
      "2025",
      "2024",
      ...displayPrograms.map((p) => getProgramYear(p)),
    ])
  ).sort((a, b) => b.localeCompare(a));

  const availableCategories = Array.from(
    new Set([...displayPrograms.map((p) => p.kategori).filter(Boolean)])
  );

  const filteredProjects = displayPrograms.filter((p) => {
    if (landingYearFilter && getProgramYear(p) !== landingYearFilter)
      return false;
    if (landingCategoryFilter && p.kategori !== landingCategoryFilter)
      return false;
    return true;
  });

  const summary = calculateSummary(filteredProjects);
  const activeCount = statusCount(filteredProjects, "Sedang Dikerjakan");
  const doneCount = statusCount(filteredProjects, "Selesai Dikerjakan");

  return (
    <div className="w-full min-h-screen bg-[#F5F8FB]">
      {/* Public Nav */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-[#DCE5ED] px-[5%] py-3.5 flex justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1E4E8C] text-white flex items-center justify-center shrink-0 shadow-sm">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <strong className="block text-[#143965] font-bold text-base leading-tight">
              SIMP-KUNINGAN
            </strong>
            <small className="block text-[#65778B] text-xs">
              Bidang Kawasan Permukiman Kab.Kuningan
            </small>
          </div>
        </div>

        <nav
          className="hidden md:flex items-center gap-6"
          aria-label="Navigasi publik"
        >
          <a
            href="#proyek"
            className="text-sm font-semibold text-[#496178] hover:text-[#1E4E8C] transition"
          >
            Proyek
          </a>
          <a
            href="#dokumentasi"
            className="text-sm font-semibold text-[#496178] hover:text-[#1E4E8C] transition"
          >
            Dokumentasi
          </a>
          <a
            href="#pencapaian"
            className="text-sm font-semibold text-[#496178] hover:text-[#1E4E8C] transition"
          >
            Pencapaian Kegiatan
          </a>
          <a
            href="#lokasi"
            className="text-sm font-semibold text-[#496178] hover:text-[#1E4E8C] transition"
          >
            Lokasi
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={triggerRefresh}
            className="p-2 rounded-lg text-[#65778B] hover:text-[#1E4E8C] transition bg-[#F5F8FB] hover:bg-[#E8EFF5]"
            title="Segarkan data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenLogin}
            className="px-5 py-2.5 rounded-xl font-bold text-sm bg-[#1E4E8C] text-white hover:bg-[#143965] transition shadow-sm"
          >
            Login
          </button>
        </div>
      </header>

      {/* Loading state */}
      {loading && !error && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1E4E8C] mb-4"></div>
          <p className="text-[#65778B] text-sm">Memuat data kegiatan...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && programs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-[#65778B] text-sm mb-3">{error}</p>
          <button
            onClick={fetchPrograms}
            className="px-4 py-2 rounded-lg text-sm bg-[#1E4E8C] text-white hover:bg-[#143965] transition"
          >
            Coba lagi
          </button>
        </div>
      )}

      {!loading && (
        <>
          {/* Hero Section — Slideshow */}
      <section className="relative text-white overflow-hidden" style={{ minHeight: "420px" }}>
        {/* Slides */}
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

        {/* Dark overlay gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(14,38,70,0.82) 0%, rgba(14,38,70,0.60) 55%, rgba(14,38,70,0.25) 100%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 px-[7%] py-16 md:py-20 max-w-3xl">
          <span className="inline-block text-xs font-bold tracking-widest text-[#BFE3E1] uppercase mb-3">
            SISTEM INFORMASI MONITORING PERMUKIMAN
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-white mb-4">
            Pembangunan permukiman yang dapat dipantau bersama.
          </h1>
          <p className="text-base sm:text-lg text-[#E0EDF7] leading-relaxed max-w-2xl">
            Pantau kegiatan, target, realisasi, dokumentasi, dan penggunaan
            anggaran pembangunan permukiman Kabupaten Kuningan secara terbuka,
            akuntabel, dan terukur.
          </p>
        </div>

        {/* Caption bawah kiri */}
        <div className="absolute bottom-4 left-[7%] z-10">
          <span className="text-[11px] text-white/70 bg-black/30 px-2.5 py-1 rounded-full backdrop-blur-sm">
            {heroSlides[heroIndex].caption}
          </span>
        </div>

        {/* Dot navigasi */}
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

      {/* Floating Public Stats */}
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
              {currency(summary.pagu)}
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

      {/* Proyek Berjalan with Category Sort by Year */}
      <section id="proyek" className="px-[5%] py-16 max-w-7xl mx-auto">
        <div className="mb-6">
          <span className="text-xs font-bold tracking-widest text-[#148B87] uppercase">
            TRANSPARANSI PELAKSANAAN
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#143965] mt-1 mb-2">
            Proyek Pembangunan Permukiman
          </h2>
          <p className="text-[#65778B] text-sm sm:text-base max-w-2xl">
            Pilih kategori tahun untuk menyortir dan melihat kegiatan prioritas yang terdaftar pada tahun anggaran tersebut.
          </p>
        </div>

        <ActivityFilters
          years={availableYears}
          categories={availableCategories}
          yearFilter={landingYearFilter}
          categoryFilter={landingCategoryFilter}
          totalCount={displayPrograms.length}
          onYearChange={setLandingYearFilter}
          onCategoryChange={setLandingCategoryFilter}
          onReset={() => {
            setLandingYearFilter("");
            setLandingCategoryFilter("");
          }}
          showReset
          className="mb-8 bg-white"
        />

        {/* Project Cards Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {filteredProjects.map((p) => {
              const badgeClass =
                p.status === "Belum Dikerjakan"
                  ? "belum"
                  : p.status === "Sedang Dikerjakan"
                  ? "sedang"
                  : "selesai";

              const desaDisplay = getProgramDesa(p);
              const kecamatanDisplay = getProgramKecamatan(p);
              const yearDisplay = getProgramYear(p);

              return (
                <div
                  key={p.id}
                  onClick={() => onSelectProgram(p.id)}
                  className="bg-white border border-[#E1E9F0] rounded-2xl p-5 hover:border-[#A8C9DC] hover:-translate-y-1 transition duration-200 shadow-sm cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E8F2F8] text-[#1E4E8C]">
                          TA {yearDisplay}
                        </span>
                        <span className={`badge ${badgeClass}`}>{p.status}</span>
                      </div>
                      <span className="text-xs text-[#65778B] font-mono">
                        {p.kode}
                      </span>
                    </div>
                    <span className="inline-block bg-[#EDF5FB] text-[#1E4E8C] px-2 py-0.5 rounded text-[10px] font-semibold mb-2">
                      {p.kategori}
                    </span>
                    <h3 className="text-base font-bold text-[#143965] mb-2 leading-snug">
                      {p.nama}
                    </h3>
                    <p className="text-xs text-[#65778B] mb-3">
                      <strong className="text-[#143965]">{desaDisplay}</strong>, Kec. {kecamatanDisplay}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-[#F0F4F8] text-xs sm:text-sm">
                    <span className="text-[#65778B]">
                      Target:{" "}
                      <strong className="text-[#143965]">
                        {quantity(p.target, p.satuan)}
                      </strong>
                    </span>
                    <span className="block text-[#148B87] mt-0.5 font-medium">
                      Realisasi: {quantity(p.realisasi, p.satuan)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-[#CCD9E4] text-[#65778B] text-sm">
            Tidak ada proyek yang sesuai dengan kategori tahun yang dipilih.
          </div>
        )}
      </section>

      {/* Dokumentasi Lapangan */}
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <article className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E1E9F0] hover:shadow-md transition">
              <img
                src="/dokumentasi/jalan-lingkungan.jpg"
                alt="Jalan lingkungan hasil pembangunan Disperkimtan Kuningan"
                className="w-full h-52 object-cover"
                loading="lazy"
              />
              <div className="p-4">
                <strong className="block text-sm font-bold text-[#143965]">
                  Jalan Lingkungan
                </strong>
                <span className="block text-xs text-[#65778B] mt-1">
                  Kecamatan Kuningan, Kabupaten Kuningan
                </span>
              </div>
            </article>

            <article className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E1E9F0] hover:shadow-md transition">
              <img
                src="/dokumentasi/drainase-tpt.jpg"
                alt="Saluran drainase dan tembok penahan tanah hasil pembangunan"
                className="w-full h-52 object-cover"
                loading="lazy"
              />
              <div className="p-4">
                <strong className="block text-sm font-bold text-[#143965]">
                  Drainase / TPT
                </strong>
                <span className="block text-xs text-[#65778B] mt-1">
                  Kecamatan Kuningan, Kabupaten Kuningan
                </span>
              </div>
            </article>

            <article className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E1E9F0] hover:shadow-md transition">
              <img
                src="/dokumentasi/konstruksi-lainnya.jpg"
                alt="Konstruksi tembok penahan tanah dan infrastruktur permukiman"
                className="w-full h-52 object-cover"
                loading="lazy"
              />
              <div className="p-4">
                <strong className="block text-sm font-bold text-[#143965]">
                  Konstruksi Lainnya
                </strong>
                <span className="block text-xs text-[#65778B] mt-1">
                  Kecamatan Kuningan, Kabupaten Kuningan
                </span>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Ringkasan Pencapaian Program Publik (Sama dengan Tampilan Pimpinan) */}
      <section id="pencapaian" className="bg-[#F5F8FB] px-[5%] py-16">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="mb-2">
            <span className="text-xs font-bold tracking-widest text-[#148B87] uppercase">
              TRANSPARANSI KINERJA
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#143965] mt-1 mb-2">
              Pencapaian Kegiatan &amp; Capaian Fisik
            </h2>
            <p className="text-[#65778B] text-sm sm:text-base max-w-2xl">
              Akumulasi capaian target dan realisasi fisik per kategori kegiatan pembangunan infrastruktur permukiman secara transparan.
            </p>
          </div>

          <PimpinanAchievementSection programs={filteredProjects} />
        </div>
      </section>

      {/* Lokasi Kami */}
      <section id="lokasi" className="px-[5%] py-16 max-w-7xl mx-auto">
        <div className="mb-8">
          <span className="text-xs font-bold tracking-widest text-[#148B87] uppercase">
            AREA PEMANTAUAN
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#143965] mt-1 mb-2">
            Lokasi Kami
          </h2>
          <p className="text-[#65778B] text-sm sm:text-base max-w-2xl">
            Area pemantauan mencakup wilayah Dinas Perumahan, Kawasan Permukiman
            dan Pertanahan Kabupaten Kuningan, Jawa Barat.
          </p>
        </div>

        <div className="bg-white border border-[#E1E9F0] rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#143965]">
                Disperkimtan Kabupaten Kuningan, Jawa Barat
              </h3>
              <p className="text-sm text-[#65778B] mt-1">
                Jl. RE. Martadinata No. 528 Ancaran, Kec. Sindangagung, Kuningan
              </p>
            </div>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Dinas+Perumahan+Kawasan+Permukiman+dan+Pertanahan+Kuningan"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-[#1E4E8C] text-white hover:bg-[#143965] transition shrink-0"
            >
              Buka di Maps <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="h-80 w-full rounded-xl overflow-hidden">
            <LeafletMap />
          </div>
        </div>
      </section>

      {/* Public Footer */}
      <footer className="bg-[#143965] text-[#D7E7F5] px-[5%] py-8 border-t border-[#1E4E8C]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <div>
            <strong className="block text-white font-bold text-base">
              SIMP-KUNINGAN - Sistem Informasi Monitoring Permukiman
            </strong>
            <p className="text-xs sm:text-sm text-[#B8D0E4] mt-1">
              Dinas Perumahan, Kawasan Permukiman dan Pertanahan Kabupaten
              Kuningan © 2026. Seluruh hak cipta dilindungi undang-undang.
            </p>
          </div>
          <div className="text-xs text-[#8BAFCF]">
            Bidang Kawasan Permukiman · Kabupaten Kuningan
          </div>
        </div>
      </footer>
        </>
      )}
    </div>
  );
};
