"use client";

import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Image as ImageIcon,
  X,
} from "lucide-react";

export interface PhotoLightboxData {
  title: string;
  tahap: string;
  tanggal: string;
  nilai?: string;
  keterangan?: string;
  penginput?: string;
  status?: string;
  photos: string[];
}

interface PhotoLightboxProps {
  data: PhotoLightboxData;
  onClose: () => void;
}

export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({ data, onClose }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const photos = data.photos.filter(Boolean);
  const currentPhoto = photos[activeIndex];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") {
        setActiveIndex((index) => (index - 1 + photos.length) % photos.length);
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((index) => (index + 1) % photos.length);
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, photos.length]);

  if (!currentPhoto) return null;

  const downloadPhoto = () => {
    const link = document.createElement("a");
    link.href = currentPhoto;
    link.download = `dokumentasi-${data.tahap.toLowerCase().replace(/\s+/g, "-")}-${activeIndex + 1}`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.click();
  };

  const movePhoto = (direction: -1 | 1) => {
    setActiveIndex((index) => (index + direction + photos.length) % photos.length);
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[#07101B]/85 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Dokumentasi ${data.tahap}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[95vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-3 border-b border-[#E1E9F0] px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-[#143965]">{data.title}</p>
            <p className="truncate text-xs text-[#65778B]">
              {data.tahap} · {data.tanggal}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={downloadPhoto}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-[#1E4E8C] hover:bg-[#E8F2F8]"
              title="Unduh foto"
            >
              <Download className="h-4 w-4" /> <span className="hidden sm:inline">Unduh</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-[#65778B] hover:bg-[#F0F4F8] hover:text-[#143965]"
              aria-label="Tutup dokumentasi foto"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="relative flex min-h-[260px] flex-1 items-center justify-center bg-[#07101B] p-3 sm:min-h-[420px]">
          <img
            src={currentPhoto}
            alt={`Dokumentasi ${data.tahap}, foto ${activeIndex + 1}`}
            className="max-h-[58vh] max-w-full object-contain"
          />
          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => movePhoto(-1)}
                className="absolute left-3 rounded-full bg-white/90 p-2.5 text-[#143965] shadow-lg hover:bg-white"
                aria-label="Foto sebelumnya"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => movePhoto(1)}
                className="absolute right-3 rounded-full bg-white/90 p-2.5 text-[#143965] shadow-lg hover:bg-white"
                aria-label="Foto berikutnya"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold text-white">
                {activeIndex + 1} dari {photos.length}
              </span>
            </>
          )}
        </div>

        {photos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto border-b border-[#E1E9F0] bg-[#F8FAFC] p-3">
            {photos.map((photo, index) => (
              <button
                type="button"
                key={`${photo}-${index}`}
                onClick={() => setActiveIndex(index)}
                className={`h-14 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                  index === activeIndex ? "border-[#1E4E8C]" : "border-transparent"
                }`}
                aria-label={`Tampilkan foto ${index + 1}`}
              >
                <img src={photo} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="grid gap-2 px-4 py-3 text-xs sm:grid-cols-3">
          <div>
            <span className="text-[#65778B]">Penginput</span>
            <strong className="block text-[#143965]">{data.penginput || "-"}</strong>
          </div>
          <div>
            <span className="text-[#65778B]">Realisasi</span>
            <strong className="block text-[#148B87]">{data.nilai || "-"}</strong>
          </div>
          <div>
            <span className="text-[#65778B]">Status</span>
            <strong className="block text-[#143965]">{data.status || "-"}</strong>
          </div>
          {data.keterangan && (
            <div className="sm:col-span-3">
              <span className="text-[#65778B]">Keterangan</span>
              <strong className="block font-medium text-[#143965]">{data.keterangan}</strong>
            </div>
          )}
        </div>
        <div className="flex items-center justify-center gap-1 border-t border-[#EAF0F4] px-4 py-2 text-[11px] text-[#65778B]">
          <ImageIcon className="h-3.5 w-3.5" /> Gunakan tombol panah atau keyboard kiri/kanan untuk berpindah foto
        </div>
      </div>
    </div>
  );
};
