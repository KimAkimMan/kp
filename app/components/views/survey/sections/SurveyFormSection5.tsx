"use client";

import React from "react";
import { Camera, X } from "lucide-react";

interface SurveyFormSection5Props {
  photoFile: File | null;
  setPhotoFile: (v: File | null) => void;
}

export function SurveyFormSection5({
  photoFile,
  setPhotoFile,
}: SurveyFormSection5Props) {
  return (
    <div>
      <div className="flex items-center gap-2 pb-2.5 mb-4 border-b border-[#EAF0F4]">
        <Camera className="w-4 h-4 text-[#1E4E8C]" />
        <h4 className="text-sm font-bold text-[#143965] uppercase tracking-wider">
          5. Dokumentasi Foto Lapangan (Titik 0%)
        </h4>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
        <div>
          <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
            Upload Foto Lapangan (Kamera / File)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setPhotoFile(file);
            }}
            className="w-full text-xs text-[#65778B] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#E8F2F8] file:text-[#1E4E8C] hover:file:bg-[#D5E6F3] cursor-pointer border border-[#CCD9E4] rounded-xl p-2 bg-[#FBFDFE]"
          />
          <p className="text-[11px] text-[#65778B] mt-1.5">
            Unggah foto dokumentasi kondisi eksisting 0% titik kerusakan sebagai bukti visual lapangan.
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <span className="text-[11px] text-[#65778B]">Gunakan contoh foto:</span>
            <button type="button" onClick={() => setPhotoFile(null)} className="text-[11px] font-bold text-[#1E4E8C] underline hover:text-[#143965]">
              Jalan Rusak
            </button>
            <span>·</span>
            <button type="button" onClick={() => setPhotoFile(null)} className="text-[11px] font-bold text-[#1E4E8C] underline hover:text-[#143965]">
              Kosongkan foto
            </button>
          </div>
        </div>
        {/* Preview Thumbnail */}
        <div>
          <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
            Pratinjau Bukti Visual
          </label>
          {photoFile ? (
            <div className="relative rounded-xl overflow-hidden border border-[#DCE5ED] bg-black/5 aspect-video max-h-48 flex items-center justify-center">
              <img src={URL.createObjectURL(photoFile)} alt="Pratinjau Survey Lapangan" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setPhotoFile(null)}
                className="absolute top-2 right-2 bg-red-600/80 hover:bg-red-600 text-white p-1 rounded-lg text-xs"
                title="Hapus foto"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#CCD9E4] p-6 text-center text-[#65778B] text-xs bg-[#FBFDFE]">
              <Camera className="w-6 h-6 mx-auto mb-1 text-[#9BB1C2]" /> Belum ada foto yang dipilih.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
