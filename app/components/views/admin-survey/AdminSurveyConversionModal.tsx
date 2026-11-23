"use client";

import React from "react";
import {
  FolderPlus,
  Sparkles,
  CheckCircle2,
  X,
} from "lucide-react";
import { FieldSurvey, Program, User } from "../../../types";
import { currency } from "../../../utils/helpers";
import { Select, Input } from "@/app/components/ui/Input";

interface AdminSurveyConversionModalProps {
  convertingSurvey: FieldSurvey | null;
  operators: User[];
  convertedNama: string;
  setConvertedNama: (v: string) => void;
  convertedKategori: string;
  setConvertedKategori: (v: string) => void;
  convertedPagu: number | "";
  setConvertedPagu: (v: number | "") => void;
  convertedTarget: number | "";
  setConvertedTarget: (v: number | "") => void;
  convertedSatuan: string;
  setConvertedSatuan: (v: string) => void;
  convertedKecamatan: string;
  setConvertedKecamatan: (v: string) => void;
  convertedDesa: string;
  setConvertedDesa: (v: string) => void;
  convertedDetailLokasi: string;
  setConvertedDetailLokasi: (v: string) => void;
  convertedOperatorId: string;
  setConvertedOperatorId: (v: string) => void;
  onClose: () => void;
  onConfirm: (data: {
    nama: string;
    namaKegiatan: string;
    kategori: string;
    pagu: number;
    target: number;
    targetVolume: number;
    satuan: string;
    kecamatan: string;
    desaKelurahan: string;
    detailLokasi: string;
    lokasi: string;
    operatorPengelolaId: number | null;
    operatorPengelola: string | null;
  }) => void;
}

export function AdminSurveyConversionModal({
  convertingSurvey,
  operators,
  convertedNama,
  setConvertedNama,
  convertedKategori,
  setConvertedKategori,
  convertedPagu,
  setConvertedPagu,
  convertedTarget,
  setConvertedTarget,
  convertedSatuan,
  setConvertedSatuan,
  convertedKecamatan,
  setConvertedKecamatan,
  convertedDesa,
  setConvertedDesa,
  convertedDetailLokasi,
  setConvertedDetailLokasi,
  convertedOperatorId,
  setConvertedOperatorId,
  onClose,
  onConfirm,
}: AdminSurveyConversionModalProps) {
  if (!convertingSurvey) return null;

  const operatorOptions = operators.filter((u) => u.role === "Operator");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedOperator = operatorOptions.find(
      (op) => String(op.id) === convertedOperatorId
    );

    onConfirm({
      nama: convertedNama.trim() || convertingSurvey.namaKegiatan,
      namaKegiatan: convertedNama.trim() || convertingSurvey.namaKegiatan,
      kategori: convertedKategori,
      pagu:
        typeof convertedPagu === "number" ? convertedPagu : 0,
      target:
        typeof convertedTarget === "number" ? convertedTarget : 1,
      targetVolume:
        typeof convertedTarget === "number" ? convertedTarget : 1,
      satuan: convertedSatuan,
      kecamatan: convertedKecamatan,
      desaKelurahan: convertedDesa,
      detailLokasi: convertedDetailLokasi,
      lokasi: [
        convertedDetailLokasi,
        convertedDesa,
        convertedKecamatan,
      ]
        .filter(Boolean)
        .join(", "),
      operatorPengelolaId: selectedOperator ? selectedOperator.id : null,
      operatorPengelola: selectedOperator ? selectedOperator.nama : null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B2540]/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#DCE5ED]">
        <div className="flex items-center justify-between p-6 border-b border-[#EAF0F4]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#E8F2F8] text-[#1E4E8C] flex items-center justify-center">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#143965]">
                Buat Master Kegiatan dari Survey
              </h3>
              <p className="text-xs text-[#65778B]">
                Sumber: {convertingSurvey.kodeSurvey} ({convertingSurvey.surveyor})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#65778B] hover:text-[#143965] hover:bg-[#F4F7FA] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-[#F0F7FD] border border-[#CDE1F3] text-xs text-[#1E4E8C] flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Data teknis, lokasi, dan estimasi biaya dari hasil survey telah
              diisikan secara otomatis ke Master Kegiatan.
            </span>
          </div>

          <div>
            <Select
              label="Kategori Kegiatan *"
              value={convertedKategori}
              onChange={(e) => setConvertedKategori(e.target.value)}
              required
            >
              <option value="Jalan Lingkungan">Jalan Lingkungan</option>
              <option value="Drainase/TPT">Drainase/TPT</option>
              <option value="Konstruksi Lainnya">Konstruksi Lainnya</option>
            </Select>
          </div>

          <div>
            <Input
              label="Nama Master Kegiatan *"
              type="text"
              value={convertedNama}
              onChange={(e) => setConvertedNama(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Input
                label="Kecamatan"
                type="text"
                value={convertedKecamatan}
                onChange={(e) => setConvertedKecamatan(e.target.value)}
              />
            </div>
            <div>
              <Input
                label="Desa / Kelurahan"
                type="text"
                value={convertedDesa}
                onChange={(e) => setConvertedDesa(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Input
              label="Detail Lokasi / Ruas Jalan"
              type="text"
              value={convertedDetailLokasi}
              onChange={(e) => setConvertedDetailLokasi(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Input
                label="Pagu Anggaran Kegiatan (Rp) *"
                type="number"
                value={convertedPagu}
                onChange={(e) =>
                  setConvertedPagu(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )}
                placeholder="Contoh: 150000000"
                className="font-mono"
                required
              />
              {typeof convertedPagu === "number" && convertedPagu > 0 && (
                <span className="text-[11px] text-[#148B87] font-semibold mt-0.5 block">
                  {currency(convertedPagu)}
                </span>
              )}
            </div>
          </div>

          <div>
            <Input
              label="Target Volume & Satuan"
              type="number"
              step="0.01"
              value={convertedTarget}
              onChange={(e) =>
                setConvertedTarget(
                  e.target.value === "" ? "" : Number(e.target.value)
                )}
              className="font-mono w-1/2"
            />
            <Select
              value={convertedSatuan}
              onChange={(e) => setConvertedSatuan(e.target.value)}
              className="w-1/2"
            >
              <option value="m'">m&#39;</option>
              <option value="m2">m2</option>
              <option value="m3">m3</option>
              <option value="Unit">Unit</option>
              <option value="ha">ha</option>
            </Select>
          </div>

          <div>
            <Select
              label="Operator Pengelola *"
              value={convertedOperatorId}
              onChange={(e) => setConvertedOperatorId(e.target.value)}
              required
            >
              <option value="">Pilih Operator Pengelola</option>
              {operatorOptions.map((op) => (
                <option key={op.id} value={String(op.id)}>
                  {op.nama}
                </option>
              ))}
            </Select>
            {convertedOperatorId && (
              <p className="text-[11px] text-[#148B87] font-medium mt-0.5">
                {operatorOptions.find((op) => String(op.id) === convertedOperatorId)?.nama}
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-[#EAF0F4] flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#65778B] hover:text-[#143965] border border-[#CCD9E4]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#1E4E8C] text-white hover:bg-[#143965] shadow-xs flex items-center gap-1.5 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              Simpan & Masukkan ke Master Kegiatan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
