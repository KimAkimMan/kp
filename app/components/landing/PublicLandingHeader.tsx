"use client";

import React from "react";
import { Landmark, ExternalLink, RefreshCw } from "lucide-react";

interface PublicLandingHeaderProps {
  onOpenLogin: () => void;
  triggerRefresh: () => void;
}

export function PublicLandingHeader({
  onOpenLogin,
  triggerRefresh,
}: PublicLandingHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-[#DCE5ED] px-[5%] py-3.5 flex justify-between items-center gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#1E4E8C] text-white flex items-center justify-center shrink-0 shadow-sm">
          <Landmark className="w-5 h-5" />
        </div>
        <div>
          <strong className="block text-[#143965] font-bold text-base leading-tight">
            SIPANTAU
          </strong>
          <small className="block text-[#65778B] text-xs">
            Penyimpanan Data & Pemantauan Kegiatan PSU
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
  );
}
