"use client";

import React from "react";

export function PublicLandingFooter() {
  return (
    <footer className="bg-[#143965] text-[#D7E7F5] px-[5%] py-8 border-t border-[#1E4E8C]">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
        <div>
          <strong className="block text-white font-bold text-base">
            SIPANTAU - Sistem Informasi Penyimpanan Data dan Pemantauan Kegiatan PSU
          </strong>
          <p className="text-xs sm:text-sm text-[#B8D0E4] mt-1">
            Data Tersimpan, Progres Terpantau · Dinas Perumahan, Kawasan Permukiman dan Pertanahan Kabupaten
            Kuningan © 2026. Seluruh hak cipta dilindungi undang-undang.
          </p>
        </div>
        <div className="text-xs text-[#8BAFCF]">
          Bidang Kawasan Permukiman · Kabupaten Kuningan
        </div>
      </div>
    </footer>
  );
}
