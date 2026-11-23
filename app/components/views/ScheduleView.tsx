"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  FileDown,
  Lock,
} from "lucide-react";
import { Program, User } from "../../types";
import {
  currency,
  quantity,
  remTarget,
  operatorAssignment,
  formatUnitSymbol,
} from "../../utils/helpers";
import { programApi } from "@/modules/programs/program.client";
import { Button } from "@/app/components/ui/Button";
import { Input, Select } from "@/app/components/ui/Input";
import { Badge } from "@/app/components/ui/Badge";
import { ConfirmDialog } from "@/app/components/ui/ConfirmDialog";
import { ScheduleMetricsGrid } from "./schedule/ScheduleMetricsGrid";
import { ScheduleProgramDetails } from "./schedule/ScheduleProgramDetails";
import { ScheduleProgressForm } from "./schedule/ScheduleProgressForm";
import { ScheduleVerifySections } from "./schedule/ScheduleVerifySections";

interface ProgressItem {
  id: number;
  programId: number;
  tanggal: string;
  tahap: string;
  volume: number;
  satuan: string;
  status: "DIAJUKAN" | "DIVERIFIKASI" | "DITOLAK";
  rejectionReason: string | null;
  catatan: string | null;
  reportedBy?: { id: number; nama: string } | null;
  verifiedBy?: { id: number; nama: string } | null;
  verifiedAt?: string | null;
}

interface CostItem {
  id: number;
  programId: number;
  tanggal: string;
  uraian: string;
  nominal: number;
  status: "DIAJUKAN" | "DIVERIFIKASI" | "DITOLAK";
  rejectionReason: string | null;
  keterangan: string | null;
  inputBy?: { id: number; nama: string } | null;
  verifiedBy?: { id: number; nama: string } | null;
  verifiedAt?: string | null;
}

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
    status: "Belum Dikerjakan" | "Sedang Dikerjakan";
    tahap: string;
    realisasi: number;
    catatan: string;
    hasPhoto: boolean;
    photoFiles?: File[];
  }) => void;
  onMarkComplete: (program: Program, hasPhoto: boolean, fotoUrls?: string[]) => void;
  onNotify: (message: string, type?: "success" | "error") => void;
  onVerifyProgress?: (
    progressId: number,
    decision: "APPROVED" | "REJECTED",
    rejectionReason?: string
  ) => Promise<void>;
  onVerifyCost?: (
    costId: number,
    decision: "APPROVED" | "REJECTED",
    rejectionReason?: string
  ) => Promise<void>;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  currentUser,
  programs,
  selectedProgramId,
  onSelectProgramId,
  onBack,
  onOpenScheduleModal,
  onOpenCostModal,
  onSaveProgress: onSaveProgressProp,
  onMarkComplete: onMarkCompleteProp,
  onNotify,
  onVerifyProgress,
  onVerifyCost,
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
    (currentUser.role === "Operator"
      ? accessiblePrograms.find((p) => p.id === selectedProgramId) ??
        accessiblePrograms[0]
      : programs.find((p) => p.id === selectedProgramId) ?? programs[0]);

  const isLocked = program?.status === "Selesai Dikerjakan";

  // Verification state
  const [progressItems, setProgressItems] = useState<ProgressItem[]>([]);
  const [costItems, setCostItems] = useState<CostItem[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [loadingCosts, setLoadingCosts] = useState(false);
  const [verifyDialog, setVerifyDialog] = useState<{
    open: boolean;
    type: "progress" | "cost";
    itemId: number;
    decision: "APPROVED" | "REJECTED";
  } | null>(null);

  // Fetch progress and costs when program changes
  useEffect(() => {
    if (
      currentUser.role !== "Admin" ||
      !program ||
      !onVerifyProgress ||
      !onVerifyCost
    )
      return;

    const fetchData = async () => {
      setLoadingProgress(true);
      setLoadingCosts(true);
      try {
        const [progRes, costRes] = await Promise.all([
          programApi.progress(program.id),
          programApi.costs(program.id),
        ]);
        if (progRes.data) setProgressItems(progRes.data as ProgressItem[]);
        if (costRes.data) setCostItems(costRes.data as CostItem[]);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Gagal memuat data verifikasi";
        onNotify(msg, "error");
      } finally {
        setLoadingProgress(false);
        setLoadingCosts(false);
      }
    };

    fetchData();
  }, [program?.id, currentUser.role, onVerifyProgress, onVerifyCost, onNotify]);

  const handleVerifyOpen = (
    type: "progress" | "cost",
    itemId: number,
    decision: "APPROVED" | "REJECTED"
  ) => {
    setVerifyDialog({ open: true, type, itemId, decision });
  };

  const handleVerifyConfirm = async (rejectionReason?: string) => {
    if (!verifyDialog || !onVerifyProgress || !onVerifyCost) return;

    const { type, itemId, decision } = verifyDialog;
    if (decision === "REJECTED" && !rejectionReason?.trim()) {
      onNotify("Alasan penolakan wajib diisi.", "error");
      return;
    }

    try {
      if (type === "progress") {
        await onVerifyProgress(itemId, decision, rejectionReason);
      } else {
        await onVerifyCost(itemId, decision, rejectionReason);
      }
      onNotify(
        `Laporan ${type === "progress" ? "progres" : "biaya"} berhasil ${decision === "APPROVED" ? "disetujui" : "ditolak"}.`,
        "success"
      );
      if (program) {
        if (type === "progress") {
          const res = await programApi.progress(program.id);
          if (res.data) setProgressItems(res.data as ProgressItem[]);
        } else {
          const res = await programApi.costs(program.id);
          if (res.data) setCostItems(res.data as CostItem[]);
        }
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : `Gagal ${decision === "APPROVED" ? "menyetujui" : "menolak"}`;
      onNotify(msg, "error");
    } finally {
      setVerifyDialog(null);
    }
  };

  const handleVerifyCancel = () => {
    setVerifyDialog(null);
  };

  // Form states for progress update
  const [updateDate, setUpdateDate] = useState("");
  const [progressStatus, setProgressStatus] = useState<
    "Belum Dikerjakan" | "Sedang Dikerjakan"
  >(
    program?.status === "Selesai Dikerjakan"
      ? "Sedang Dikerjakan"
      : program?.status || "Sedang Dikerjakan"
  );
  const [progressStage, setProgressStage] = useState("");
  const [realizationInput, setRealizationInput] = useState<string>("0");
  const [updateNote, setUpdateNote] = useState(program?.catatan || "");
  const [photos, setPhotos] = useState<File[]>([]);
  const [progressError, setProgressError] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
    if (photos.length === 0) {
      setProgressError(
        "Dokumentasi foto wajib diunggah minimal 1 foto (maksimal 3 foto)."
      );
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

    void onSaveProgressProp({
      tanggal: updateDate,
      status: progressStatus,
      tahap: progressStage.trim(),
      realisasi: val,
      catatan: updateNote.trim(),
      hasPhoto: true,
      photoFiles: photos,
    });
  };

  const handleTriggerMarkComplete = () => {
    setProgressError("");
    if (isLocked) return;

    if (photos.length === 0) {
      setProgressError(
        "Dokumentasi foto wajib diunggah sebelum kegiatan ditandai selesai (maksimal 3 foto)."
      );
      return;
    }
    if (program.realisasi < program.target) {
      setProgressError("Realisasi fisik belum mencapai target penuh (100%).");
      return;
    }

    void onMarkCompleteProp(program, true);
  };

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    try {
      const { downloadActivityPdf } = await import("../../utils/activity-export");
      downloadActivityPdf(program, `${currentUser.nama} (${currentUser.role})`);
      onNotify("Detail kegiatan berhasil diunduh dalam format PDF.");
    } catch (error) {
      const details = error instanceof Error ? `: ${error.message}` : "";
      onNotify(`Gagal menyiapkan PDF kegiatan${details}`, "error");
    } finally {
      setIsExporting(false);
    }
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (val: number | string | undefined) => {
    if (!val) return "Rp 0";
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="space-y-6">
      {!program && (
        <div className="text-center py-16 text-[#65778B] bg-white rounded-2xl border border-[#E1E9F0]">
          Belum ada kegiatan yang tersedia untuk akun Operator ini.
        </div>
      )}
      {program && (
        <>
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#E8F2F8] text-[#1E4E8C] hover:bg-[#D8EAF5] transition mb-3"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Data Kegiatan
        </button>
        <h2 className="text-2xl font-bold text-[#143965]">
          Detail Kegiatan & Pengaturan
        </h2>
        <p className="text-xs sm:text-sm text-[#65778B] mt-0.5">
          Atur jadwal, target, progres, dan dokumentasi lapangan kegiatan yang
          ditugaskan kepada Anda.
        </p>
      </div>

      {isLocked && (
        <div className="bg-[#E7F6ED] border border-[#BCE5CC] rounded-2xl p-4 flex items-center gap-3 text-sm text-[#258050] font-semibold">
          <Lock className="w-5 h-5 shrink-0" />
          <span>
            Kegiatan ini telah dinyatakan <strong>Selesai Dikerjakan</strong> dan
            terkunci secara otomatis. Data telah diarsipkan.
          </span>
        </div>
      )}

      <section className="bg-white rounded-2xl p-6 border border-[#E1E9F0] shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 pb-5 border-b border-[#EAF0F4]">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-xs font-bold text-[#35536F] uppercase whitespace-nowrap">
              Pilih Kegiatan:
            </label>
            <Select
              value={program.id}
              onChange={(e) => onSelectProgramId(Number(e.target.value))}
              className="flex-1 sm:w-80 border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white font-medium text-[#143965]"
            >
              {accessiblePrograms.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 w-full sm:w-auto">
            {!isLocked && (
              <button
                onClick={() => onOpenScheduleModal(program)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#1E4E8C] text-white hover:bg-[#143965] transition shadow-xs"
              >
                <Calendar className="w-4 h-4" /> Pengaturan Jadwal & Target
              </button>
            )}
            <button
              type="button"
              onClick={() => void handleDownloadPdf()}
              disabled={isExporting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#E7F6ED] text-[#258050] hover:bg-[#D4EFE0] disabled:opacity-60 disabled:cursor-wait transition border border-[#BCE5CC]"
            >
              <FileDown className="w-4 h-4" />
              {isExporting ? "Menyiapkan..." : "Unduh PDF"}
            </button>
          </div>
        </div>

        <ScheduleMetricsGrid program={program} />

        <ScheduleProgramDetails program={program} />
      </section>

      {!isLocked && (
        <ScheduleProgressForm
          program={program}
          isLocked={isLocked}
          updateDate={updateDate}
          setUpdateDate={setUpdateDate}
          progressStatus={progressStatus}
          setProgressStatus={setProgressStatus}
          progressStage={progressStage}
          setProgressStage={setProgressStage}
          realizationInput={realizationInput}
          setRealizationInput={setRealizationInput}
          updateNote={updateNote}
          setUpdateNote={setUpdateNote}
          photos={photos}
          setPhotos={setPhotos}
          progressError={progressError}
          setProgressError={setProgressError}
          fileInputRef={fileInputRef}
          onSaveProgress={handleProgressSubmit}
          onMarkComplete={handleTriggerMarkComplete}
        />
      )}

      {currentUser.role === "Admin" && (
        <ScheduleVerifySections
          currentUser={currentUser}
          program={program}
          loadingProgress={loadingProgress}
          loadingCosts={loadingCosts}
          progressItems={progressItems}
          costItems={costItems}
          onVerifyOpen={handleVerifyOpen}
          formatDate={formatDate}
        />
      )}

      <ConfirmDialog
        open={verifyDialog?.open ?? false}
        title={
          verifyDialog
            ? `Konfirmasi ${verifyDialog.decision === "APPROVED" ? "Persetujuan" : "Penolakan"} Laporan ${verifyDialog.type === "progress" ? "Progres" : "Biaya"}`
            : "Konfirmasi"
        }
        message={
          verifyDialog
            ? verifyDialog.decision === "APPROVED"
              ? `Apakah Anda yakin ingin menyetujui laporan ${verifyDialog.type === "progress" ? "progres" : "biaya"} ini? Data akan diperbarui dan tidak dapat diubah kembali.`
              : `Masukkan alasan penolakan laporan ${verifyDialog.type === "progress" ? "progres" : "biaya"} ini:`
            : ""
        }
        onConfirm={handleVerifyConfirm}
        onCancel={handleVerifyCancel}
        confirmLabel={
          verifyDialog?.decision === "APPROVED" ? "Ya, Setujui" : "Tolak"
        }
      />
        </>
      )}
    </div>
  );
};
