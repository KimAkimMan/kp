/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { Landmark, ArrowRight, ExternalLink } from "lucide-react";
import { Program } from "../types";
import {
  calculateSummary,
  statusCount,
  currency,
  quantity,
} from "../utils/helpers";
import { SimpleBarChart, SimpleDoughnutChart } from "./Charts";
import { LeafletMap } from "./LeafletMap";

interface PublicLandingProps {
  programs: Program[];
  onOpenLogin: () => void;
  onSelectProgram: (id: number) => void;
}

export const PublicLanding: React.FC<PublicLandingProps> = ({
  programs,
  onOpenLogin,
  onSelectProgram,
}) => {
  const summary = calculateSummary(programs);
  const activeCount = statusCount(programs, "Sedang Dikerjakan");
  const doneCount = statusCount(programs, "Selesai Dikerjakan");
  const runningProjects = programs
    .filter((p) => p.status !== "Selesai Dikerjakan")
    .slice(0, 3);
  const validVolumeGroups = summary.volume.filter((g) => g.target > 0);

  const budgetPercent =
    summary.pagu > 0
      ? Math.round((summary.penggunaan / summary.pagu) * 100)
      : 0;

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
            href="#laporan-publik"
            className="text-sm font-semibold text-[#496178] hover:text-[#1E4E8C] transition"
          >
            Laporan
          </a>
          <a
            href="#pencapaian"
            className="text-sm font-semibold text-[#496178] hover:text-[#1E4E8C] transition"
          >
            Pencapaian
          </a>
          <a
            href="#lokasi"
            className="text-sm font-semibold text-[#496178] hover:text-[#1E4E8C] transition"
          >
            Lokasi
          </a>
        </nav>

        <button
          onClick={onOpenLogin}
          className="px-5 py-2.5 rounded-xl font-bold text-sm bg-[#1E4E8C] text-white hover:bg-[#143965] transition shadow-sm"
        >
          Login
        </button>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#143965] via-[#1E4E8C] to-[#286BA3] text-white px-[7%] py-16 md:py-24 overflow-hidden">
        <div className="max-w-3xl">
          <span className="inline-block text-xs font-bold tracking-widest text-[#BFE3E1] uppercase mb-3">
            SISTEM MONITORING DAN PELAPORAN PROGRAM
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-white mb-4">
            Pembangunan permukiman yang dapat dipantau bersama.
          </h1>
          <p className="text-base sm:text-lg text-[#E0EDF7] leading-relaxed mb-8 max-w-2xl">
            Pantau kegiatan, target, realisasi, dokumentasi, dan penggunaan
            anggaran pembangunan permukiman Kabupaten Kuningan secara terbuka,
            akuntabel, dan terukur.
          </p>
          <button
            onClick={onOpenLogin}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base bg-white text-[#1E4E8C] hover:bg-[#F0F5FA] transition shadow-lg"
          >
            Masuk ke Sistem <ArrowRight className="w-4 h-4" />
          </button>
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

      {/* Proyek Berjalan */}
      <section id="proyek" className="px-[5%] py-16 max-w-7xl mx-auto">
        <div className="mb-8">
          <span className="text-xs font-bold tracking-widest text-[#148B87] uppercase">
            TRANSPARANSI PELAKSANAAN
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#143965] mt-1 mb-2">
            Proyek yang Sedang Berjalan
          </h2>
          <p className="text-[#65778B] text-sm sm:text-base max-w-2xl">
            Informasi pelaksanaan kegiatan prioritas beserta target dan
            realisasi di wilayah Kabupaten Kuningan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {runningProjects.map((p) => {
            const badgeClass =
              p.status === "Belum Dikerjakan"
                ? "belum"
                : p.status === "Sedang Dikerjakan"
                ? "sedang"
                : "selesai";

            return (
              <div
                key={p.id}
                onClick={() => onSelectProgram(p.id)}
                className="bg-white border border-[#E1E9F0] rounded-2xl p-5 hover:border-[#A8C9DC] hover:-translate-y-1 transition duration-200 shadow-sm cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <span className={`badge ${badgeClass}`}>{p.status}</span>
                    <span className="text-xs text-[#65778B] font-medium">
                      {p.kode}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#143965] mb-2 leading-snug">
                    {p.nama}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#65778B] mb-3">
                    {p.lokasi}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <article className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E1E9F0] hover:shadow-md transition">
              <img
                src="https://images.pexels.com/photos/32054406/pexels-photo-32054406.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Pekerja konstruksi marka jalan di desa"
                className="w-full h-44 object-cover"
                loading="lazy"
              />
              <div className="p-4">
                <strong className="block text-sm font-bold text-[#143965]">
                  Perbaikan Jalan Lingkungan
                </strong>
                <span className="block text-xs text-[#65778B] mt-1">
                  Desa Ciawigebang
                </span>
              </div>
            </article>

            <article className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E1E9F0] hover:shadow-md transition">
              <img
                src="https://images.pexels.com/photos/32257223/pexels-photo-32257223.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Pekerja pada saluran drainase besar"
                className="w-full h-44 object-cover"
                loading="lazy"
              />
              <div className="p-4">
                <strong className="block text-sm font-bold text-[#143965]">
                  Peningkatan Drainase
                </strong>
                <span className="block text-xs text-[#65778B] mt-1">
                  Desa Kertawinangun
                </span>
              </div>
            </article>

            <article className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E1E9F0] hover:shadow-md transition">
              <img
                src="https://images.pexels.com/photos/12726229/pexels-photo-12726229.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Instalasi pipa dan sarana air bersih"
                className="w-full h-44 object-cover"
                loading="lazy"
              />
              <div className="p-4">
                <strong className="block text-sm font-bold text-[#143965]">
                  Sarana Air Bersih
                </strong>
                <span className="block text-xs text-[#65778B] mt-1">
                  Kecamatan Cigugur
                </span>
              </div>
            </article>

            <article className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E1E9F0] hover:shadow-md transition">
              <img
                src="https://images.pexels.com/photos/38470293/pexels-photo-38470293.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Tampak kawasan permukiman rapi"
                className="w-full h-44 object-cover"
                loading="lazy"
              />
              <div className="p-4">
                <strong className="block text-sm font-bold text-[#143965]">
                  Penataan Lingkungan
                </strong>
                <span className="block text-xs text-[#65778B] mt-1">
                  Desa Cisantana
                </span>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Banner Laporan Publik */}
      <section id="laporan-publik" className="px-[5%] py-12 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-[#143965] to-[#1E4E8C] text-white rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md">
          <div>
            <span className="text-xs font-bold tracking-widest text-[#BFE3E1] uppercase">
              LAPORAN TRANSPARANSI
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-2 mb-2">
              Laporan Periode 2026
            </h2>
            <p className="text-sm sm:text-base text-[#CCE0F2] max-w-xl">
              Ringkasan pelaksanaan kegiatan, capaian target fisik, realisasi
              volume, serta transparansi penyerapan anggaran tahun berjalan.
            </p>
          </div>
          <button
            onClick={onOpenLogin}
            className="px-6 py-3.5 rounded-xl font-bold text-sm bg-white text-[#1E4E8C] hover:bg-[#F0F5FA] transition shrink-0 shadow"
          >
            Masuk untuk Lihat Laporan
          </button>
        </div>
      </section>

      {/* Ringkasan Pencapaian Publik */}
      <section id="pencapaian" className="bg-[#F5F8FB] px-[5%] py-16">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <span className="text-xs font-bold tracking-widest text-[#148B87] uppercase">
              RINGKASAN PUBLIK
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#143965] mt-1 mb-2">
              Ringkasan Pencapaian Program
            </h2>
            <p className="text-[#65778B] text-sm sm:text-base max-w-2xl">
              Ringkasan agregat target, realisasi, dan penggunaan anggaran
              seluruh kegiatan yang dapat diakses oleh publik.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Pencapaian Program */}
            <article className="bg-white border border-[#E1E9F0] rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#143965] mb-1">
                Keseluruhan Pencapaian Program
              </h3>
              <p className="text-xs sm:text-sm text-[#65778B] mb-5">
                {validVolumeGroups.length > 0
                  ? `${validVolumeGroups
                      .map(
                        (g) =>
                          `${g.satuan}: ${g.persentase.toLocaleString("id-ID", {
                            maximumFractionDigits: 1,
                          })}%`
                      )
                      .join(" · ")} · ${programs.length} kegiatan`
                  : "Belum ada target yang valid"}
              </p>

              {validVolumeGroups.length > 0 ? (
                <SimpleBarChart
                  labels={validVolumeGroups.map((g) => g.satuan)}
                  datasets={[
                    {
                      label: "Target",
                      data: validVolumeGroups.map((g) => g.target),
                      backgroundColor: "#1E4E8C",
                    },
                    {
                      label: "Realisasi",
                      data: validVolumeGroups.map((g) => g.realisasi),
                      backgroundColor: "#148B87",
                    },
                  ]}
                  formatValue={(v) =>
                    v.toLocaleString("id-ID", { maximumFractionDigits: 2 })
                  }
                  height={240}
                />
              ) : (
                <div className="text-center py-16 text-[#65778B] border border-dashed border-[#C9D8E3] rounded-xl text-sm">
                  Belum ada data program untuk ditampilkan.
                </div>
              )}
            </article>

            {/* Chart 2: Penggunaan Anggaran */}
            <article className="bg-white border border-[#E1E9F0] rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#143965] mb-1">
                Keseluruhan Penggunaan Anggaran
              </h3>
              <p className="text-xs sm:text-sm text-[#65778B] mb-5">
                {summary.pagu > 0
                  ? `${currency(summary.penggunaan)} digunakan (${budgetPercent}%) · Sisa ${currency(
                      summary.sisaAnggaran
                    )} dari total ${currency(summary.pagu)}`
                  : "Belum ada nilai anggaran yang tersedia"}
              </p>

              {summary.pagu > 0 ? (
                <SimpleDoughnutChart
                  labels={["Digunakan", "Sisa Anggaran"]}
                  data={[summary.penggunaan, summary.sisaAnggaran]}
                  backgroundColors={["#148B87", "#E78A31"]}
                  formatValue={(v) => currency(v)}
                  height={240}
                />
              ) : (
                <div className="text-center py-16 text-[#65778B] border border-dashed border-[#C9D8E3] rounded-xl text-sm">
                  Belum ada data anggaran untuk ditampilkan.
                </div>
              )}
            </article>
          </div>
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
      <footer className="bg-[#143965] text-[#D7E7F5] px-[5%] py-10 border-t border-[#1E4E8C]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6 text-center sm:text-left">
          <div>
            <strong className="block text-white font-bold text-base">
              SIMP-KUNINGAN - Sistem Informasi Monitoring Permukiman
            </strong>
            <p className="text-xs sm:text-sm text-[#B8D0E4] mt-1">
              Dinas Perumahan, Kawasan Permukiman dan Pertanahan Kabupaten
              Kuningan © 2026.
            </p>
          </div>
          <button
            onClick={onOpenLogin}
            className="px-5 py-2.5 rounded-xl font-bold text-sm bg-[#148B87] text-white hover:bg-[#10706D] transition shadow"
          >
            Login Internal
          </button>
        </div>
      </footer>
    </div>
  );
};
