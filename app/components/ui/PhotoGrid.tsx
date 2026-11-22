"use client";

import React from "react";

interface PhotoGridProps {
  photos: Array<{
    id: string;
    storageKey: string;
    originalName: string | null;
    surveyId: string;
    createdAt: string;
  }>;
  photoUrls: Record<string, string>;
  onRemove?: (photoId: string) => void;
  maxHeight?: string;
}

export function PhotoGrid({
  photos,
  photoUrls,
  onRemove,
  maxHeight = "max-h-48",
}: PhotoGridProps) {
  if (photos.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {photos.map((photo) => {
        const url = photoUrls[photo.id];
        return (
          <div
            key={photo.id}
            className="relative rounded-xl overflow-hidden border border-[#DCE5ED] aspect-video bg-black/5"
          >
            {url ? (
              <img
                src={url}
                alt={`Foto ${photo.originalName || "Lapangan"}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-[#65778B] bg-[#F4F7FA]">
                Memuat...
              </div>
            )}
            {photo.originalName && (
              <div className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1 py-0.5 rounded">
                {photo.originalName}
              </div>
            )}
            {onRemove && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(photo.id);
                }}
                className="absolute top-1 right-1 bg-red-600/90 text-white p-1 rounded-full hover:bg-red-700 transition shadow-xs"
                title="Hapus foto"
              >
                <span className="w-3 h-3">×</span>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
