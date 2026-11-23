"use client";

import React from "react";
import { Layers } from "lucide-react";
import { FieldSurvey, Program, User } from "../../../../types";
import { Select, Input } from "@/app/components/ui/Input";

interface SurveyFormSection1Props {
  currentUser: User;
  programs: Program[];
  selectedProgramId: number | "";
  setSelectedProgramId: (id: number | "") => void;
  namaKegiatan: string;
  setNamaKegiatan: (v: string) => void;
  kategori: string;
  setKategori: (v: string) => void;
  tanggal: string;
  setTanggal: (v: string) => void;
  surveyor: string;
  setSurveyor: (v: string) => void;
  kontakPendamping: string;
  setKontakPendamping: (v: string) => void;
  kecamatan: string;
  setKecamatan: (v: string) => void;
  desaKelurahan: string;
  setDesaKelurahan: (v: string) => void;
  detailLokasi: string;
  setDetailLokasi: (v: string) => void;
  handleProgramSelect: (progId: number | "") => void;
}

export function SurveyFormSection1({
  currentUser,
  programs,
  selectedProgramId,
  setSelectedProgramId,
  namaKegiatan,
  setNamaKegiatan,
  kategori,
  setKategori,
  tanggal,
  setTanggal,
  surveyor,
  setSurveyor,
  kontakPendamping,
  setKontakPendamping,
  kecamatan,
  setKecamatan,
  desaKelurahan,
  setDesaKelurahan,
  detailLokasi,
  setDetailLokasi,
  handleProgramSelect,
}: SurveyFormSection1Props) {
  return (
    <div>
      <div className="flex items-center gap-2 pb-2.5 mb-4 border-b border-[#EAF0F4]">
        <Layers className="w-4 h-4 text-[#1E4E8C]" />
        <h4 className="text-sm font-bold text-[#143965] uppercase tracking-wider">
          1. Informasi Kegiatan & Petugas Lapangan
        </h4>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Hubungkan ke Program / Kegiatan */}
        <div className="lg:col-span-2">
          <Select
            label="Hubungkan ke Data Kegiatan (Opsional)"
            value={selectedProgramId}
            onChange={(e) =>
              handleProgramSelect(
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
          >
            <option value="">
              — Survey Mandiri / Usulan Baru (Non-Program Terdaftar) —
            </option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.kode}] {p.nama} — {p.lokasi}
              </option>
            ))}
          </Select>
          <p className="text-[11px] text-[#65778B] mt-1">
            Pilih kegiatan untuk mengisi otomatis lokasi, kategori, dan detail
            teknis dari master kegiatan.
          </p>
        </div>
        {/* Tanggal Survey */}
        <div>
          <Input
            label="Tanggal Pelaksanaan Survey *"
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            required
          />
        </div>
        {/* Nama Kegiatan / Judul Lokasi */}
        <div className="lg:col-span-2">
          <Input
            label="Nama Kegiatan / Judul Lokasi Survey *"
            type="text"
            value={namaKegiatan}
            onChange={(e) => setNamaKegiatan(e.target.value)}
            placeholder="Contoh: Perbaikan Jalan Lingkungan Ruas Dusun Manis"
            required
          />
        </div>
        {/* Kategori Prasarana */}
        <div>
          <Select
            label="Kategori Prasarana *"
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
          >
            <option value="Jalan Lingkungan">Jalan Lingkungan</option>
            <option value="Drainase/TPT">Drainase/TPT</option>
            <option value="Konstruksi Lainnya">Konstruksi Lainnya</option>
          </Select>
        </div>
        {/* Surveyor */}
        <div>
          <Input
            label="Nama Petugas Surveyor (Operator) *"
            type="text"
            value={surveyor}
            onChange={(e) => setSurveyor(e.target.value)}
            required
          />
        </div>
        {/* Kontak / Pendamping Lapangan */}
        <div className="lg:col-span-2">
          <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
            Pendamping / Tokoh Lapangan (RT / RW / Tokoh Warga)
          </label>
          <input
            type="text"
            value={kontakPendamping}
            onChange={(e) => setKontakPendamping(e.target.value)}
            placeholder="Contoh: Pak Sutrisno (Ketua RW 02 - 08123456789)"
            className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
          />
        </div>
      </div>
    </div>
  );
}
