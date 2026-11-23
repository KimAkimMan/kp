"use client";

import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Program, User } from "../../types";
import {
  defaultKecamatanList,
  standardCategories,
} from "../../data/initialData";
import { ModalFrame } from "./ModalFrame";

interface ActivityModalProps {
  activity?: Program | null;
  operators?: User[];
  onClose: () => void;
  onSave: (data: Partial<Program>) => void | Promise<void>;
}

export const ActivityModal: React.FC<ActivityModalProps> = ({
  activity,
  operators = [],
  onClose,
  onSave,
}) => {
  const [kategori, setKategori] = useState(activity?.kategori || "");
  const [nama, setNama] = useState(activity?.nama || "");
  const [pagu, setPagu] = useState<string>(
    activity?.pagu !== undefined ? String(activity.pagu) : "0"
  );
  const [kecamatan, setKecamatan] = useState(activity?.kecamatan || "");
  const [desa, setDesa] = useState(activity?.desaKelurahan || "");
  const [detailLokasi, setDetailLokasi] = useState(
    activity?.detailLokasi || ""
  );
  const [operatorId, setOperatorId] = useState<string>(
    activity?.operatorPengelolaId !== undefined &&
      activity?.operatorPengelolaId !== null
      ? String(activity.operatorPengelolaId)
      : ""
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!kategori) {
      setError("Kategori kegiatan wajib dipilih.");
      return;
    }
    if (!nama.trim()) {
      setError("Nama kegiatan wajib diisi.");
      return;
    }
    const paguNum = Number(pagu);
    if (pagu.trim() !== "" && (!Number.isFinite(paguNum) || paguNum < 0)) {
      setError("Nilai pagu anggaran wajib berupa angka positif.");
      return;
    }

    const fullLocation = [detailLokasi.trim(), desa.trim(), kecamatan.trim()]
      .filter(Boolean)
      .join(", ");

    const assignedOp = operators.find((u) => String(u.id) === operatorId);

    setIsSubmitting(true);
    try {
      await onSave({
        kategori,
        nama: nama.trim(),
        namaKegiatan: nama.trim(),
        ...(pagu.trim() !== "" ? { pagu: paguNum } : {}),
        kecamatan: kecamatan.trim(),
        desaKelurahan: desa.trim(),
        detailLokasi: detailLokasi.trim(),
        lokasi: fullLocation || activity?.lokasi || "Kabupaten Kuningan",
        operatorPengelola: assignedOp ? assignedOp.nama : null,
        operatorPengelolaId: assignedOp ? assignedOp.id : null,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalFrame
      title={activity ? "Ubah Master Kegiatan" : "Tambah Master Kegiatan"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
            Kategori / Jenis Kegiatan
          </label>
          <select
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
            required
          >
            <option value="">Pilih kategori...</option>
            {standardCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
            Nama Kegiatan
          </label>
          <input
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
            placeholder="Contoh: Pembangunan Jalan Usaha Tani"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
            Nilai Pagu Anggaran (Rp)
          </label>
          <input
            type="number"
            min="0"
            value={pagu}
            onChange={(e) => setPagu(e.target.value)}
            className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
            placeholder="0"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Kecamatan
            </label>
            <select
              value={kecamatan}
              onChange={(e) => setKecamatan(e.target.value)}
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
              required
            >
              <option value="">Pilih kecamatan...</option>
              {kecamatan && !defaultKecamatanList.includes(kecamatan) && (
                <option value={kecamatan}>{kecamatan}</option>
              )}
              {defaultKecamatanList.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Desa / Kelurahan
            </label>
            <input
              type="text"
              value={desa}
              onChange={(e) => setDesa(e.target.value)}
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
              placeholder="Nama desa atau kelurahan"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
            Detail Lokasi / Ruas Jalan
          </label>
          <input
            type="text"
            value={detailLokasi}
            onChange={(e) => setDetailLokasi(e.target.value)}
            className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
            placeholder="Contoh: Ruas Jalan Blok Wage RT 02/01"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
            Tugaskan Operator Pelaksana (Opsional)
          </label>
          <select
            value={operatorId}
            onChange={(e) => setOperatorId(e.target.value)}
            className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white font-medium text-[#143965]"
          >
            <option value="">
              -- Belum Ditugaskan (Dapat Diambil & Diedit oleh Semua Operator) --
            </option>
            {operators
              .filter((u) => u.role === "Operator")
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nama} ({u.email})
                </option>
              ))}
          </select>
          <span className="text-[11px] text-[#65778B] block mt-1">
            Kegiatan yang belum ditugaskan akan langsung muncul di akun Operator untuk diambil dan dilengkapi.
          </span>
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
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#1E4E8C] text-white hover:bg-[#143965] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Master Kegiatan"}
          </button>
        </div>
      </form>
    </ModalFrame>
  );
};
