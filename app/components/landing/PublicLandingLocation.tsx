"use client";

import React from "react";
import { ExternalLink } from "lucide-react";
import { LeafletMap } from "../LeafletMap";

const AREA_MARKERS = [
  {
    lat: -6.974,
    lng: 108.495,
    title: "Kec. Kuningan (Pusat)",
    popup: "Pusat Pemerintahan dan Monitoring",
  },
  {
    lat: -6.92,
    lng: 108.52,
    title: "Kec. Cigugur",
    popup: "Area kegiatan program infrastruktur",
  },
  {
    lat: -7.02,
    lng: 108.45,
    title: "Kec. Sindangagung",
    popup: "Area kegiatan program infrastruktur",
  },
  {
    lat: -6.95,
    lng: 108.58,
    title: "Kec. Jalaksana",
    popup: "Area kegiatan program infrastruktur",
  },
  {
    lat: -6.88,
    lng: 108.42,
    title: "Kec. Ciawigebang",
    popup: "Area kegiatan program infrastruktur",
  },
];

export function PublicLandingLocation() {
  return (
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
          <LeafletMap markers={AREA_MARKERS} />
        </div>
      </div>
    </section>
  );
}
