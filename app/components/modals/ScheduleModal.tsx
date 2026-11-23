"use client";

import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Program } from "../../types";
import {
  currency,
  isRoadCategory,
} from "../../utils/helpers";
import { unitOptions } from "../../data/initialData";
import { ModalFrame } from "./ModalFrame";

interface ScheduleModalProps {
  program: Program;
  onClose: () => void;
  onSave: (data: Partial<Program>) => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  program,
  onClose,
  onSave,
}) => {
  const isRoad = isRoadCategory(program.kategori);

  const formatForDateOnly = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    } catch {
      return "";
    }
  };

  const [satuan, setSatuan] = useState(program.satuan || "Unit");
  const [targetAwal, setTargetAwal] = useState<string>(
    program.targetAwal && program.targetAwal > 0 ? String(program.targetAwal) : ""
  );
  const [targetVolume, setTargetVolume] = useState<string>(
    program.target && program.target > 0 ? String(program.target) : ""
  );
  const [penyedia, setPenyedia] = useState(program.penyedia || "");
  const [direktur, setDirektur] = useState(program.direktur || "");
  const [nilaiKontrak, setNilaiKontrak] = useState<string>(
    program.nilaiKontrak !== undefined && program.nilaiKontrak !== null
      ? String(program.nilaiKontrak)
      : ""
  );
  const [noKontrak, setNoKontrak] = useState(program.noKontrak || "");

  const [tanggalMulai, setTanggalMulai] = useState(
    formatForDateOnly(program.tanggalMulai) || "2026-01-01"
  );
  const [tanggalSelesai, setTanggalSelesai] = useState(
    formatForDateOnly(program.tanggalSelesai) || "2026-12-31"
  );

  const extractYear = (p?: string) => {
    if (!p) return new Date().getFullYear();
    const match = p.match(/\b(20\d{2})\b/);
    return match ? Number(match[1]) : new Date().getFullYear();
  };
  const [periodeTahun, setPeriodeTahun] = useState<number | string>(
    extractYear(program.periode)
  );

  const [lebarJalan, setLebarJalan] = useState<string>(
    program.lebarJalan !== undefined ? String(program.lebarJalan) : ""
  );
  const [kondisiJalan, setKondisiJalan] = useState(
    program.kondisiJalan || "Sedang"
  );
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tAwal = Number(targetAwal);
    const tVol = Number(targetVolume);

    if (!Number.isFinite(tAwal) || tAwal <= 0) {
      setError("Target Awal wajib berupa angka lebih besar dari 0.");
      return;
    }
    if (!Number.isFinite(tVol) || tVol <= 0) {
      setError("Target Volume berjalan wajib berupa angka lebih besar dari 0.");
      return;
    }
    if (tVol < program.realisasi) {
      setError(
        "Target berjalan tidak boleh lebih kecil dari realisasi yang sudah tercatat."
      );
      return;
    }
    if (!tanggalMulai) {
      setError("Tanggal awal pelaksanaan wajib diisi.");
      return;
    }
    if (!tanggalSelesai) {
      setError("Tanggal akhir pelaksanaan wajib diisi.");
      return;
    }
    if (new Date(tanggalMulai) > new Date(tanggalSelesai)) {
      setError(
        "Tanggal awal pelaksanaan tidak boleh setelah tanggal akhir pelaksanaan."
      );
      return;
    }
    if (!periodeTahun || isNaN(Number(periodeTahun))) {
      setError(
        "Periode tahun pelaksanaan wajib diisi angka tahun yang valid."
      );
      return;
    }

    if (isRoad) {
      const lebar = Number(lebarJalan);
      if (!Number.isFinite(lebar) || lebar <= 0) {
        setError("Lebar jalan wajib diisi dengan angka lebih besar dari 0.");
        return;
      }
    }

    const formatIndoDate = (dateStr: string) => {
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
      } catch {
        return dateStr;
      }
    };
    const jadwalLabel = `${formatIndoDate(tanggalMulai)} s/d ${formatIndoDate(tanggalSelesai)}`;

    onSave({
      satuan,
      targetAwal: tAwal,
      target: tVol,
      targetVolume: tVol,
      penyedia: penyedia.trim(),
      direktur: direktur.trim(),
      nilaiKontrak: nilaiKontrak.trim() ? Number(nilaiKontrak) : null,
      noKontrak: noKontrak.trim() || null,
      tanggalMulai,
      tanggalSelesai,
      jadwal: jadwalLabel,
      periode: String(periodeTahun),
      ...(isRoad
        ? {
            lebarJalan: Number(lebarJalan),
            kondisiJalan,
          }
        : {}),
    });
  };

  const formatIndoDateShort = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <ModalFrame title="Isi & Sesuaikan Data Kegiatan" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-[#F6F9FB] border border-[#E0EBF2] p-4 rounded-xl text-xs space-y-1.5">
          <div>
            <strong className="text-[#143965]">Nama Kegiatan:</strong>{" "}
            {program.nama}
          </div>
          <div>
            <strong className="text-[#143965]">Kategori:</strong>{" "}
            {program.kategori}
          </div>
          <div>
            <strong className="text-[#143965]">Lokasi:</strong> {program.lokasi}
          </div>
          <div>
            <strong className="text-[#143965]">Pagu Anggaran:</strong>{" "}
            {currency(program.pagu)}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Satuan Pengukuran
            </label>
            <select
              value={satuan}
              onChange={(e) => setSatuan(e.target.value)}
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
              required
            >
              {unitOptions.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Target Awal ({satuan})
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={targetAwal}
              onChange={(e) => setTargetAwal(e.target.value)}
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
              required
            />
          </div>
        </div>

        {isRoad && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#FBFDFE] p-3 rounded-xl border border-[#DFEAF0]">
            <div>
              <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                Lebar Jalan (meter)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={lebarJalan}
                onChange={(e) => setLebarJalan(e.target.value)}
                className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                Kondisi Jalan
              </label>
              <select
                value={kondisiJalan}
                onChange={(e) => setKondisiJalan(e.target.value)}
                className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
                required
              >
                <option value="Baik">Baik</option>
                <option value="Sedang">Sedang</option>
                <option value="Rusak">Rusak</option>
              </select>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Penyedia CV / PT
            </label>
            <input
              type="text"
              value={penyedia}
              onChange={(e) => setPenyedia(e.target.value)}
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
              placeholder="Nama perusahaan pelaksana"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Direktur / Penanggung Jawab
            </label>
            <input
              type="text"
              value={direktur}
              onChange={(e) => setDirektur(e.target.value)}
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
              placeholder="Nama direktur"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Nilai Kontrak Final (Rp)
            </label>
            <input
              type="number"
              min="0"
              value={nilaiKontrak}
              onChange={(e) => setNilaiKontrak(e.target.value)}
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
              placeholder="Sesuai SPK"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Nomor Kontrak / SPK
            </label>
            <input
              type="text"
              value={noKontrak}
              onChange={(e) => setNoKontrak(e.target.value)}
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
              placeholder="602.1/.../SPK/..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#FBFDFE] p-3.5 rounded-xl border border-[#DFEAF0]">
          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Tanggal Awal Pelaksanaan *
            </label>
            <input
              type="date"
              value={tanggalMulai}
              onChange={(e) => setTanggalMulai(e.target.value)}
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white font-medium"
              required
            />
            <span className="text-[10px] text-[#65778B] mt-0.5 block">
              Pilih tanggal mulai pengerjaan
            </span>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Tanggal Akhir Pelaksanaan *
            </label>
            <input
              type="date"
              value={tanggalSelesai}
              onChange={(e) => setTanggalSelesai(e.target.value)}
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white font-medium"
              required
            />
            <span className="text-[10px] text-[#65778B] mt-0.5 block">
              Pilih tanggal target selesai
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Periode (Tahun) *
            </label>
            <input
              type="number"
              min="2020"
              max="2035"
              value={periodeTahun}
              onChange={(e) => setPeriodeTahun(e.target.value)}
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white font-semibold text-[#143965]"
              placeholder="Contoh: 2026"
              required
            />
            <span className="text-[10px] text-[#65778B] mt-0.5 block">
              Tahun anggaran pelaksanaan
            </span>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Target Volume Berjalan ({satuan}) *
            </label>
            <input
              type="number"
              step="any"
              min={program.realisasi}
              value={targetVolume}
              onChange={(e) => setTargetVolume(e.target.value)}
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white font-semibold text-[#148B87]"
              required
            />
            <span className="text-[10px] text-[#65778B] mt-0.5 block">
              Tidak boleh kurang dari realisasi ({program.realisasi})
            </span>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-[#C44C3B] font-semibold">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <div className="flex justify-end gap-2.5 pt-4 border-t border-[#EAF0F4]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#E8F2F8] text-[#1E4E8C] hover:bg-[#D8EAF5]"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#1E4E8C] text-white hover:bg-[#143965]"
          >
            Simpan Pengaturan
          </button>
        </div>
      </form>
    </ModalFrame>
  );
};
