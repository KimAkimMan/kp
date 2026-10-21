"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Save,
  CheckCircle2,
  WalletCards,
  Lock,
  Paperclip,
  AlertCircle,
} from "lucide-react";
import { Program, User } from "../../types";
import {
  currency,
  quantity,
  remTarget,
  remBudget,
  operatorAssignment,
  formatUnitSymbol,
} from "../../utils/helpers";

interface ScheduleViewProps {
  currentUser: User;
  programs: Program[];
  selectedProgramId: number;
  onSelectProgramId: (id: number) => void;
  onBack: () => void;
  onOpenScheduleModal: (p: Program) => void;
  onOpenCostModal: (p: Program) => void;
  onSaveProgress: (data: {
    tanggal: string;
    status: "Belum Dikerjakan" | "Sedang Dikerjakan" | "Selesai Dikerjakan";
    tahap: string;
    realisasi: number;
    catatan: string;
    hasPhoto: boolean;
  }) => void;
  onMarkComplete: (program: Program, hasPhoto: boolean) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  currentUser,
  programs,
  selectedProgramId,
  onSelectProgramId,
  onBack,
  onOpenScheduleModal,
  onOpenCostModal,
  onSaveProgress,
  onMarkComplete,
}) => {
  const accessiblePrograms = programs.filter((p) => {
    const owner = operatorAssignment(p);
    return (
      !owner ||
      (owner.explicitId
        ? owner.id === String(currentUser.id)
        : owner.name === currentUser.nama)
    );
  });

  const program =
    programs.find((p) => p.id === selectedProgramId) ||
    accessiblePrograms[0] ||
    programs[0];

  const isLocked = program?.status === "Selesai Dikerjakan";

  // Form states for progress update
  const [updateDate, setUpdateDate] = useState("");
  const [progressStatus, setProgressStatus] = useState<
    "Belum Dikerjakan" | "Sedang Dikerjakan" | "Selesai Dikerjakan"
  >(program?.status || "Sedang Dikerjakan");
  const [progressStage, setProgressStage] = useState("");
  const [realizationInput, setRealizationInput] = useState<string>(
    program?.realisasi !== undefined ? String(program.realisasi) : "0"
  );
  const [updateNote, setUpdateNote] = useState(program?.catatan || "");
  const [hasPhoto, setHasPhoto] = useState(false);
  const [progressError, setProgressError] = useState("");

  if (!program) {
    return (
      <div className="text-center py-16 text-[#65778B] bg-white rounded-2xl border border-[#E1E9F0]">
        Belum ada kegiatan yang tersedia untuk akun Operator ini.
      </div>
    );
  }

  const handleProgressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProgressError("");

    if (isLocked) {
      setProgressError(
        "Kegiatan sudah Selesai Dikerjakan dan terkunci; perubahan tidak dapat disimpan."
      );
      return;
    }

    const val = Number(realizationInput);
    if (!updateDate || !progressStage.trim() || !updateNote.trim()) {
      setProgressError("Tanggal, tahap pekerjaan, dan keterangan wajib diisi.");
      return;
    }
    if (!hasPhoto) {
      setProgressError("Dokumentasi foto wajib diunggah untuk verifikasi progres.");
      return;
    }
    if (!Number.isFinite(val) || val < 0) {
      setProgressError("Realisasi harus berupa angka valid.");
      return;
    }
    if (val > program.target) {
      setProgressError("Realisasi tidak boleh melebihi target kegiatan.");
      return;
    }
    if (progressStatus === "Selesai Dikerjakan" && val < program.target) {
      setProgressError("Status selesai hanya dapat dipilih jika realisasi telah mencapai target penuh.");
      return;
    }

    onSaveProgress({
      tanggal: updateDate,
      status: progressStatus,
      tahap: progressStage.trim(),
      realisasi: val,
      catatan: updateNote.trim(),
      hasPhoto,
    });
  };

  const handleTriggerMarkComplete = () => {
    setProgressError("");
    if (isLocked) return;

    if (!hasPhoto) {
      setProgressError("Dokumentasi foto wajib diunggah sebelum kegiatan ditandai selesai.");
      return;
    }
    if (program.realisasi < program.target) {
      setProgressError("Realisasi fisik belum mencapai target penuh (100%).");
      return;
    }

    onMarkComplete(program, hasPhoto);
  };

  return (
    <div className="space-y-6">
      {/* Top action */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#E8F2F8] text-[#1E4E8C] hover:bg-[#D8EAF5] transition mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Kegiatan Saya
        </button>
        <h2 className="text-2xl font-bold text-[#143965]">
          Detail Kegiatan & Pengaturan
        </h2>
        <p className="text-xs sm:text-sm text-[#65778B] mt-0.5">
          Atur jadwal, target, progres, dokumentasi lapangan, dan pencatatan biaya kegiatan yang ditugaskan kepada Anda.
        </p>
      </div>

      {isLocked && (
        <div className="bg-[#E7F6ED] border border-[#BCE5CC] rounded-2xl p-4 flex items-center gap-3 text-sm text-[#258050] font-semibold">
          <Lock className="w-5 h-5 shrink-0" />
          <span>
            Kegiatan ini telah dinyatakan <strong>Selesai Dikerjakan</strong> dan terkunci secara otomatis. Data telah diarsipkan.
          </span>
        </div>
      )}

      {/* Program Selector & Settings Panel */}
      <section className="bg-white rounded-2xl p-6 border border-[#E1E9F0] shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 pb-5 border-b border-[#EAF0F4]">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-xs font-bold text-[#35536F] uppercase whitespace-nowrap">
              Pilih Kegiatan:
            </label>
            <select
              value={program.id}
              onChange={(e) => onSelectProgramId(Number(e.target.value))}
              className="flex-1 sm:w-80 border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white font-medium text-[#143965]"
            >
              {accessiblePrograms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama}
                </option>
              ))}
            </select>
          </div>

          {!isLocked && (
            <button
              onClick={() => onOpenScheduleModal(program)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#1E4E8C] text-white hover:bg-[#143965] transition shadow-xs"
            >
              <Calendar className="w-4 h-4" /> Edit Data Kegiatan (Form Operator)
            </button>
          )}
        </div>

        {/* Target Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
          <div className="p-3.5 rounded-xl border border-[#DFEAF0] bg-[#FBFDFE]">
            <p className="text-[11px] text-[#65778B] m-0 font-medium">Target Awal</p>
            <strong className="block text-sm sm:text-base font-bold text-[#143965] mt-1">
              {quantity(program.targetAwal, program.satuan)}
            </strong>
          </div>
          <div className="p-3.5 rounded-xl border border-[#DFEAF0] bg-[#FBFDFE]">
            <p className="text-[11px] text-[#65778B] m-0 font-medium">Target Berjalan</p>
            <strong className="block text-sm sm:text-base font-bold text-[#143965] mt-1">
              {quantity(program.target, program.satuan)}
            </strong>
          </div>
          <div className="p-3.5 rounded-xl border border-[#DFEAF0] bg-[#FBFDFE]">
            <p className="text-[11px] text-[#65778B] m-0 font-medium">Realisasi Terakhir</p>
            <strong className="block text-sm sm:text-base font-bold text-[#148B87] mt-1">
              {quantity(program.realisasi, program.satuan)}
            </strong>
          </div>
          <div className="p-3.5 rounded-xl border border-[#DFEAF0] bg-[#FBFDFE]">
            <p className="text-[11px] text-[#65778B] m-0 font-medium">Sisa Target</p>
            <strong className="block text-sm sm:text-base font-bold text-[#E78A31] mt-1">
              {quantity(remTarget(program), program.satuan)}
            </strong>
          </div>
          <div className="p-3.5 rounded-xl border border-[#DFEAF0] bg-[#FBFDFE] col-span-2 sm:col-span-1">
            <p className="text-[11px] text-[#65778B] m-0 font-medium">Update Terakhir</p>
            <strong className="block text-xs font-semibold text-[#143965] mt-1 truncate">
              {program.update}
            </strong>
          </div>
        </div>

        {/* Detail attributes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs pt-3 border-t border-[#F0F4F8]">
          <div className="py-1 border-b border-[#F0F4F8]">
            <span className="text-[#65778B]">Periode:</span>{" "}
            <strong className="text-[#143965] ml-1">Tahun {program.periode}</strong>
          </div>
          <div className="py-1 border-b border-[#F0F4F8]">
            <span className="text-[#65778B]">Waktu Pelaksanaan:</span>{" "}
            <strong className="text-[#143965] ml-1">{program.jadwal || "Sesuai periode"}</strong>
          </div>
          <div className="py-1 border-b border-[#F0F4F8]">
            <span className="text-[#65778B]">Penanggung Jawab:</span>{" "}
            <strong className="text-[#143965] ml-1">{program.pj}</strong>
          </div>
          <div className="py-1 border-b border-[#F0F4F8]">
            <span className="text-[#65778B]">Lokasi Rinci:</span>{" "}
            <strong className="text-[#143965] ml-1">{program.lokasi}</strong>
          </div>
          <div className="py-1 border-b border-[#F0F4F8]">
            <span className="text-[#65778B]">Penyedia CV/PT:</span>{" "}
            <strong className="text-[#143965] ml-1">{program.penyedia || "-"}</strong>
          </div>
          <div className="py-1 border-b border-[#F0F4F8]">
            <span className="text-[#65778B]">Nomor Kontrak / SPK:</span>{" "}
            <strong className="text-[#143965] ml-1">{program.noKontrak || "-"}</strong>
          </div>
        </div>
      </section>

      {/* Progress & Realization Update Form */}
      {!isLocked && (
        <section className="bg-white rounded-2xl p-6 border border-[#E1E9F0] shadow-xs">
          <h3 className="text-base font-bold text-[#143965] mb-1">
            Pembaruan Progres & Realisasi Lapangan
          </h3>
          <p className="text-xs text-[#65778B] mb-5">
            Input capaian fisik berkala disertai dokumentasi foto untuk validasi data pengawasan.
          </p>

          <form onSubmit={handleProgressSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                  Tanggal Update
                </label>
                <input
                  type="date"
                  value={updateDate}
                  onChange={(e) => setUpdateDate(e.target.value)}
                  className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
                  required
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
                      e.target.value as "Belum Dikerjakan" | "Sedang Dikerjakan" | "Selesai Dikerjakan"
                    )
                  }
                  className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
                  required
                >
                  <option value="Belum Dikerjakan">Belum Dikerjakan</option>
                  <option value="Sedang Dikerjakan">Sedang Dikerjakan</option>
                  <option value="Selesai Dikerjakan">Selesai Dikerjakan</option>
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
                  className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                  Total Realisasi Kumulatif ({formatUnitSymbol(program.satuan)})
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  max={program.target}
                  value={realizationInput}
                  onChange={(e) => setRealizationInput(e.target.value)}
                  className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white font-semibold"
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
                className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider mb-1">
                Dokumentasi Foto Lapangan (Wajib)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setHasPhoto(Boolean(e.target.files?.length))}
                className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-xs bg-white file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#E8F2F8] file:text-[#1E4E8C]"
                required
              />
            </div>

            {progressError && (
              <div className="flex items-center gap-1.5 text-xs text-[#C44C3B] font-semibold">
                <AlertCircle className="w-4 h-4" /> {progressError}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#1E4E8C] text-white hover:bg-[#143965] transition shadow-xs"
              >
                <Save className="w-4 h-4" /> Simpan Realisasi
              </button>

              <button
                type="button"
                onClick={handleTriggerMarkComplete}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#E7F6ED] text-[#258050] hover:bg-[#D4EFE0] transition border border-[#BCE5CC]"
              >
                <CheckCircle2 className="w-4 h-4" /> Tandai Selesai
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Catat Biaya Kegiatan */}
      <section className="bg-white rounded-2xl p-6 border border-[#E1E9F0] shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
          <div>
            <h3 className="text-base font-bold text-[#143965]">
              Catat Penggunaan Biaya Kegiatan
            </h3>
            <p className="text-xs text-[#65778B] mt-0.5">
              Kelola pencatatan pengeluaran anggaran dan dokumentasi kuitansi per tahap.
            </p>
          </div>

          {!isLocked && (
            <button
              onClick={() => onOpenCostModal(program)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#148B87] text-white hover:bg-[#10706D] transition shadow-xs"
            >
              <WalletCards className="w-4 h-4" /> Tambah Penggunaan Biaya
            </button>
          )}
        </div>

        {/* Budget Bar Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 p-4 rounded-xl bg-[#F6FBFD] border border-[#D6E5EC] text-xs">
          <div>
            <span className="text-[#65778B]">Pagu Anggaran:</span>
            <strong className="block text-sm font-bold text-[#143965] mt-0.5">
              {currency(program.pagu)}
            </strong>
          </div>
          <div>
            <span className="text-[#65778B]">Total Digunakan:</span>
            <strong className="block text-sm font-bold text-[#148B87] mt-0.5">
              {currency(program.penggunaan)}
            </strong>
          </div>
          <div>
            <span className="text-[#65778B]">Sisa Anggaran:</span>
            <strong className="block text-sm font-bold text-[#E78A31] mt-0.5">
              {currency(remBudget(program))}
            </strong>
          </div>
        </div>

        {/* Costs Table */}
        <div className="overflow-x-auto border border-[#E3EBF0] rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F6F9FB] text-[#61738A] uppercase font-bold text-[11px]">
              <tr>
                <th className="p-3">Tanggal</th>
                <th className="p-3">Uraian Transaksi</th>
                <th className="p-3">Nominal (Rp)</th>
                <th className="p-3">Input Oleh</th>
                <th className="p-3">Bukti</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAF0F4]">
              {program.costs.length > 0 ? (
                program.costs.map((c, i) => (
                  <tr key={i} className="hover:bg-[#FBFDFE]">
                    <td className="p-3 text-[#65778B] whitespace-nowrap">{c.tanggal}</td>
                    <td className="p-3 font-semibold text-[#143965]">{c.uraian}</td>
                    <td className="p-3 font-bold text-[#148B87] whitespace-nowrap">
                      {currency(c.nominal)}
                    </td>
                    <td className="p-3 text-[#65778B]">{c.input}</td>
                    <td className="p-3 whitespace-nowrap">
                      {c.bukti ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1E4E8C]">
                          <Paperclip className="w-3.5 h-3.5" /> Bukti tersedia
                        </span>
                      ) : (
                        <span className="text-[#65778B] text-[11px]">Tidak ada</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-[#65778B]">
                    Belum ada transaksi penggunaan biaya untuk kegiatan ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
