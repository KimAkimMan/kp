"use client";

import React from "react";
import { Program } from "../../../types";
import {
  quantity,
  formatUnitSymbol,
} from "../../../utils/helpers";

interface ScheduleProgressFormProps {
  program: Program;
  isLocked: boolean;
  updateDate: string;
  setUpdateDate: (v: string) => void;
  progressStatus: "Belum Dikerjakan" | "Sedang Dikerjakan";
  setProgressStatus: (v: "Belum Dikerjakan" | "Sedang Dikerjakan") => void;
  progressStage: string;
  setProgressStage: (v: string) => void;
  realizationInput: string;
  setRealizationInput: (v: string) => void;
  updateNote: string;
  setUpdateNote: (v: string) => void;
  photos: File[];
  setPhotos: React.Dispatch<React.SetStateAction<File[]>>;
  progressError: string;
  setProgressError: (v: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onSaveProgress: (e: React.FormEvent) => void;
  onMarkComplete: () => void;
}

export function ScheduleProgressForm({
  program,
  isLocked,
  updateDate,
  setUpdateDate,
  progressStatus,
  setProgressStatus,
  progressStage,
  setProgressStage,
  realizationInput,
  setRealizationInput,
  updateNote,
  setUpdateNote,
  photos,
  setPhotos,
  progressError,
  setProgressError,
  fileInputRef,
  onSaveProgress,
  onMarkComplete,
}: ScheduleProgressFormProps) {
  return (
    <section className="bg-white rounded-2xl p-6 border border-[#E1E9F0] shadow-xs">
      <h3 className="text-base font-bold text-[#143965] mb-1">
        Pembaruan Progres & Realisasi Lapangan
      </h3>
      <p className="text-xs text-[#65778B] mb-5">
        Input capaian fisik berkala disertai dokumentasi foto untuk validasi data
        pengawasan.
      </p>

      <form onSubmit={onSaveProgress} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Tanggal Update
            </label>
            <input
              type="date"
              value={updateDate}
              onChange={(e) => setUpdateDate(e.target.value)}
              required
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-xs bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Status Pekerjaan
            </label>
            <select
              value={progressStatus}
              onChange={(e) =>
                setProgressStatus(
                  e.target.value as "Belum Dikerjakan" | "Sedang Dikerjakan"
                )
              }
              required
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-xs bg-white font-semibold text-[#143965]"
            >
              <option value="Belum Dikerjakan">Belum Dikerjakan</option>
              <option value="Sedang Dikerjakan">Sedang Dikerjakan</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Tahap Pekerjaan Lapangan
            </label>
            <input
              type="text"
              value={progressStage}
              onChange={(e) => setProgressStage(e.target.value)}
              placeholder="Contoh: Penghamparan agregat ruas kedua"
              required
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-xs bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Tambahan Capaian ({formatUnitSymbol(program.satuan)})
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={realizationInput}
              onChange={(e) => setRealizationInput(e.target.value)}
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-xs bg-white font-semibold"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
            Keterangan / Catatan Teknis
          </label>
          <input
            type="text"
            value={updateNote}
            onChange={(e) => setUpdateNote(e.target.value)}
            placeholder="Keterangan hasil pekerjaan hari ini..."
            required
            className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-xs bg-white"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider">
              Dokumentasi Foto Lapangan (Wajib, Maksimal 3 Foto)
            </label>
            <span className="text-[11px] font-semibold text-[#1E4E8C] bg-[#E8F2F8] px-2 py-0.5 rounded-md">
              {photos.length} dari 3 foto terpilih
            </span>
          </div>

          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-3">
              {photos.map((file, index) => (
                <div
                  key={index}
                  className="relative group rounded-xl overflow-hidden border-2 border-[#1E4E8C]/30 bg-[#F8FAFC] aspect-video sm:aspect-square flex items-center justify-center shadow-xs"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview foto ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    Foto {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== index))}
                    className="absolute top-1.5 right-1.5 bg-red-600/90 text-white p-1 rounded-full hover:bg-red-700 transition shadow-xs"
                    title="Hapus foto ini"
                  >
                    <span className="w-3.5 h-3.5">✕</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {photos.length < 3 ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const files = e.target.files;
                  if (!files || files.length === 0) return;

                  const remainingSlots = 3 - photos.length;
                  if (remainingSlots <= 0) {
                    setProgressError("Maksimal 3 foto dokumentasi lapangan.");
                    if (fileInputRef.current) fileInputRef.current.value = "";
                    return;
                  }

                  const filesToProcess = Array.from(files).slice(0, remainingSlots);
                  if (files.length > remainingSlots) {
                    setProgressError(
                      `Hanya ${remainingSlots} foto yang dapat ditambahkan (maksimal 3 foto).`
                    );
                  } else {
                    setProgressError("");
                  }

                  const allowedTypes = [
                    "image/jpeg",
                    "image/png",
                    "image/webp",
                    "image/gif",
                  ];
                  const invalidFiles = filesToProcess.filter(
                    (f) => !allowedTypes.includes(f.type)
                  );
                  if (invalidFiles.length > 0) {
                    setProgressError(
                      "Tipe file tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF."
                    );
                    if (fileInputRef.current) fileInputRef.current.value = "";
                    return;
                  }

                  const maxSize = 2 * 1024 * 1024;
                  const oversizedFiles = filesToProcess.filter(
                    (f) => f.size > maxSize
                  );
                  if (oversizedFiles.length > 0) {
                    setProgressError(
                      "Salah satu foto terlalu besar (maksimal 2MB per foto)."
                    );
                    if (fileInputRef.current) fileInputRef.current.value = "";
                    return;
                  }

                  setPhotos((prev) => [...prev, ...filesToProcess].slice(0, 3));
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-xs bg-white file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#E8F2F8] file:text-[#1E4E8C]"
              />
              <p className="text-[11px] text-[#65778B] mt-1">
                Format didukung: JPG, PNG, WEBP. Anda dapat mengunggah hingga 3
                foto sekaligus (tersisa {3 - photos.length} slot).
              </p>
            </div>
          ) : (
            <div className="p-3 bg-[#E7F6ED] border border-[#BCE5CC] rounded-xl text-xs text-[#258050] font-semibold flex items-center justify-between">
              <span>Maksimal 3 foto dokumentasi telah terpenuhi.</span>
              <button
                type="button"
                onClick={() => setPhotos([])}
                className="text-xs text-[#C44C3B] underline font-bold ml-2"
              >
                Reset Semua Foto
              </button>
            </div>
          )}
        </div>

        {progressError && (
          <div className="flex items-center gap-1.5 text-xs text-[#C44C3B] font-semibold">
            <span className="w-4 h-4">⚠</span> {progressError}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#1E4E8C] text-white hover:bg-[#143965] transition shadow-xs"
          >
            <span className="w-4 h-4">💾</span> Simpan Realisasi
          </button>

          <button
            type="button"
            onClick={onMarkComplete}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#E7F6ED] text-[#258050] hover:bg-[#D4EFE0] transition border border-[#BCE5CC]"
          >
            <span className="w-4 h-4">✓</span> Tandai Selesai
          </button>
        </div>
      </form>
    </section>
  );
}
