"use client";

import React from "react";
import { Info, CheckCircle2 } from "lucide-react";
import { Select } from "@/app/components/ui/Input";

interface SurveyFormSection3Props {
  kondisi:
    | "Baik"
    | "Rusak Ringan"
    | "Rusak Sedang"
    | "Rusak Berat";
  setKondisi: (v: "Baik" | "Rusak Ringan" | "Rusak Sedang" | "Rusak Berat") => void;
  tipeKonstruksi: string;
  setTipeKonstruksi: (v: string) => void;
  panjang: number | "";
  setPanjang: (v: number | "") => void;
  lebar: number | "";
  setLebar: (v: number | "") => void;
  luasVolume: number | "";
  setLuasVolume: (v: number | "") => void;
  satuan: string;
  setSatuan: (v: string) => void;
  tingkatUrgensi: "Rendah" | "Sedang" | "Tinggi / Mendesak";
  setTingkatUrgensi: (v: "Rendah" | "Sedang" | "Tinggi / Mendesak") => void;
  handlePanjangChange: (val: string) => void;
  handleLebarChange: (val: string) => void;
}

export function SurveyFormSection3({
  kondisi,
  setKondisi,
  tipeKonstruksi,
  setTipeKonstruksi,
  panjang,
  setPanjang,
  lebar,
  setLebar,
  luasVolume,
  setLuasVolume,
  satuan,
  setSatuan,
  tingkatUrgensi,
  setTingkatUrgensi,
  handlePanjangChange,
  handleLebarChange,
}: SurveyFormSection3Props) {
  return (
    <div>
      <div className="flex items-center gap-2 pb-2.5 mb-4 border-b border-[#EAF0F4]">
        <Info className="w-4 h-4 text-[#1E4E8C]" />
        <h4 className="text-sm font-bold text-[#143965] uppercase tracking-wider">
          3. Kondisi Eksisting & Dimensi Teknis
        </h4>
      </div>
      {/* Kondisi Visual Selector */}
      <div className="mb-4">
        <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-2">
          Kondisi Eksisting Infrastruktur *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Baik", color: "border-[#258050] text-[#258050] bg-[#E7F6ED]" },
            { label: "Rusak Ringan", color: "border-[#D98E04] text-[#B07300] bg-[#FEF7E9]" },
            { label: "Rusak Sedang", color: "border-[#E78A31] text-[#BD6C1E] bg-[#FFF3E8]" },
            { label: "Rusak Berat", color: "border-[#BD493B] text-[#BD493B] bg-[#FDEEED]" },
          ].map((item) => {
            const isSelected = kondisi === item.label;
            return (
              <button
                type="button"
                key={item.label}
                onClick={() => setKondisi(item.label as typeof kondisi)}
                className={`p-3 rounded-xl border-2 text-center font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 ${
                  isSelected
                    ? `${item.color} shadow-xs ring-2 ring-offset-1 ring-[#1E4E8C]/30`
                    : "border-[#DCE5ED] bg-white text-[#65778B] hover:border-[#BACDD9]"
                }`}
              >
                {isSelected && <CheckCircle2 className="w-4 h-4 shrink-0" />}
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tipe Konstruksi */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
            Tipe Eksisting / Konstruksi
          </label>
          <input
            type="text"
            value={tipeKonstruksi}
            onChange={(e) => setTipeKonstruksi(e.target.value)}
            placeholder="Contoh: Aspal Lapen / Rabat Beton / Paving Block"
            className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
          />
        </div>
        {/* Panjang */}
        <div>
          <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
            Panjang (Meter)
          </label>
          <input
            type="number"
            step="0.01"
            value={panjang}
            onChange={(e) => handlePanjangChange(e.target.value)}
            placeholder="Contoh: 350"
            className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
          />
        </div>
        {/* Lebar */}
        <div>
          <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
            Lebar (Meter)
          </label>
          <input
            type="number"
            step="0.01"
            value={lebar}
            onChange={(e) => handleLebarChange(e.target.value)}
            placeholder="Contoh: 3.0"
            className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
          />
        </div>
        {/* Luas / Volume */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
            Luas / Volume Estimasi
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              value={luasVolume}
              onChange={(e) => setLuasVolume(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="Contoh: 1050"
              className="flex-1 border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
            />
            <Select value={satuan} onChange={(e) => setSatuan(e.target.value)} className="w-40">
              <option value="m'">m&#39;</option>
              <option value="m2">m2</option>
              <option value="m3">m3</option>
              <option value="Unit">Unit</option>
              <option value="ha">ha</option>
              <option value="Titik">Titik</option>
            </Select>
          </div>
        </div>
        {/* Tingkat Urgensi */}
        <div className="sm:col-span-2">
          <Select
            label="Tingkat Urgensi Penanganan *"
            value={tingkatUrgensi}
            onChange={(e) => setTingkatUrgensi(e.target.value as typeof tingkatUrgensi)}
          >
            <option value="Tinggi / Mendesak">Tinggi / Mendesak (Prioritas Utama)</option>
            <option value="Sedang">Sedang (Dapat dijadwalkan tahun berjalan)</option>
            <option value="Rendah">Rendah (Pemeliharaan berkala)</option>
          </Select>
        </div>
      </div>
    </div>
  );
}
