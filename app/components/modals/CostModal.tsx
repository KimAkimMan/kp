"use client";

import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Program } from "../../types";
import { currency, remBudget } from "../../utils/helpers";
import { ModalFrame } from "./ModalFrame";

interface CostModalProps {
  program: Program;
  onClose: () => void;
  onSave: (cost: {
    tanggal: string;
    tahap: string;
    uraian: string;
    nominal: number;
    hasProof: boolean;
  }) => void;
}

export const CostModal: React.FC<CostModalProps> = ({
  program,
  onClose,
  onSave,
}) => {
  const [tanggal, setTanggal] = useState("");
  const [tahap, setTahap] = useState("");
  const [uraian, setUraian] = useState("");
  const [nominal, setNominal] = useState("");
  const [hasProof, setHasProof] = useState(false);
  const [error, setError] = useState("");

  const sisa = remBudget(program);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tanggal || !tahap.trim() || !uraian.trim()) {
      setError("Semua field tanggal, tahap, dan uraian wajib diisi.");
      return;
    }
    const amount = Number(nominal);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Nominal biaya wajib lebih besar dari 0.");
      return;
    }
    if (amount > sisa) {
      setError(`Penggunaan biaya melebihi sisa pagu (${currency(sisa)}).`);
      return;
    }

    onSave({
      tanggal,
      tahap: tahap.trim(),
      uraian: uraian.trim(),
      nominal: amount,
      hasProof,
    });
  };

  return (
    <ModalFrame title="Catat Penggunaan Biaya Kegiatan" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-[#F6FBFD] p-3.5 rounded-xl border border-[#D6E5EC] text-xs">
          <p className="text-[#65778B] m-0">Sisa pagu anggaran kegiatan ini:</p>
          <strong className="block text-base text-[#143965] font-bold mt-0.5">
            {currency(sisa)}
          </strong>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Tanggal Penggunaan
            </label>
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Tahap / Jenis Pekerjaan
            </label>
            <input
              type="text"
              value={tahap}
              onChange={(e) => setTahap(e.target.value)}
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
              placeholder="Contoh: Pembelian material U-ditch"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
            Uraian Rinci Pengeluaran
          </label>
          <input
            type="text"
            value={uraian}
            onChange={(e) => setUraian(e.target.value)}
            className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
            placeholder="Keterangan transaksi"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Nominal Pengeluaran (Rp)
            </label>
            <input
              type="number"
              min="1"
              value={nominal}
              onChange={(e) => setNominal(e.target.value)}
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
              placeholder="0"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
              Bukti Kuitansi / Nota
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setHasProof(Boolean(e.target.files?.length))}
              className="w-full border border-[#CCD9E4] rounded-xl px-3 py-1.5 text-xs bg-white file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#EDF4F8] file:text-[#1E4E8C]"
            />
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
            Simpan Biaya
          </button>
        </div>
      </form>
    </ModalFrame>
  );
};
