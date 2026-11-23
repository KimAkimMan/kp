"use client";

import React, { type Dispatch, type SetStateAction } from "react";
import { AlertTriangle } from "lucide-react";
import { Select, Input } from "@/app/components/ui/Input";

interface SurveyFormSection4Props {
  uraianTemuan: string;
  setUraianTemuan: Dispatch<SetStateAction<string>>;
  rekomendasi: string;
  setRekomendasi: Dispatch<SetStateAction<string>>;
  estimasiBiaya: number | "";
  setEstimasiBiaya: Dispatch<SetStateAction<number | "">>;
  status:
    | "Draft"
    | "Selesai Survey"
    | "Menunggu Verifikasi"
    | "Perlu Revisi"
    | "Diverifikasi"
    | "Dikonversi";
  setStatus: Dispatch<SetStateAction<Status>>;
}

type Status =
  | "Draft"
  | "Selesai Survey"
  | "Menunggu Verifikasi"
  | "Perlu Revisi"
  | "Diverifikasi"
  | "Dikonversi";

export function SurveyFormSection4({
  uraianTemuan,
  setUraianTemuan,
  rekomendasi,
  setRekomendasi,
  estimasiBiaya,
  setEstimasiBiaya,
  status,
  setStatus,
}: SurveyFormSection4Props) {
  return (
    <div>
      <div className="flex items-center gap-2 pb-2.5 mb-4 border-b border-[#EAF0F4]">
        <AlertTriangle className="w-4 h-4 text-[#1E4E8C]" />
        <h4 className="text-sm font-bold text-[#143965] uppercase tracking-wider">
          4. Temuan Kerusakan Lapangan & Rekomendasi
        </h4>
      </div>
      <div className="space-y-4">
        {/* Uraian Temuan */}
        <div>
          <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
            Uraian Temuan Kondisi / Kerusakan Fisik di Lapangan *
          </label>
          <textarea
            rows={3}
            value={uraianTemuan}
            onChange={(e) => setUraianTemuan(e.target.value)}
            placeholder="Jelaskan kondisi detail kerusakan, seperti badan jalan ambles, saluran tersumbat, retak buaya, dsb..."
            required
            className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1E4E8C]/20"
          />
        </div>
        {/* Rekomendasi Penanganan */}
        <div>
          <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
            Rekomendasi Penanganan Teknis
          </label>
          <textarea
            rows={2}
            value={rekomendasi}
            onChange={(e) => setRekomendasi(e.target.value)}
            placeholder="Usulan konstruksi atau perbaikan (contoh: Pembangunan rabat beton mutu K-250 tebal 15 cm disertai pembuatan saluran tali air)..."
            className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1E4E8C]/20"
          />
        </div>
        {/* Estimasi & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Estimasi Kebutuhan Anggaran (Rupiah)
            </label>
            <input
              type="number"
              value={estimasiBiaya}
              onChange={(e) => setEstimasiBiaya(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="Contoh: 150000000"
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white font-mono"
            />
          </div>
          <div>
            <Select
              label="Status Hasil Survey Lapangan"
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
            >
              <option value="Selesai Survey">Selesai Survey (Data Lengkap)</option>
              <option value="Draft">Draft (Belum Lengkap / Perlu Lanjutan)</option>
              <option value="Menunggu Verifikasi">Menunggu Verifikasi (Siap Diperiksa Admin)</option>
              <option value="Perlu Revisi">Perlu Revisi (Perlu Perbaikan)</option>
              <option value="Diverifikasi">Diverifikasi (Disetujui Admin)</option>
              <option value="Dikonversi">Dikonversi (Sudah Jadi Program)</option>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
