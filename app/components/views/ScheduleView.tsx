"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  Save,
  CheckCircle2,
  Lock,
  AlertCircle,
  Image as ImageIcon,
  X,
  Upload,
  FileDown,
  CheckCircle,
  X as XIcon,
  Clock,
  Send,
} from "lucide-react";
import { Program, User } from "../../types";
import {
  currency,
  quantity,
  remTarget,
  operatorAssignment,
  formatUnitSymbol,
} from "../../utils/helpers";
import { Button } from "@/app/components/ui/Button";
import { Input, Select } from "@/app/components/ui/Input";
import { Badge } from "@/app/components/ui/Badge";
import { ConfirmDialog } from "@/app/components/ui/ConfirmDialog";
import { programApi } from "@/modules/programs/program.client";

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
  storageKey?: string | null;
  originalName?: string | null;
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
  documents?: Array<Record<string, unknown>>;
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
  onVerifyProgress?: (progressId: number, decision: "APPROVED" | "REJECTED", rejectionReason?: string) => Promise<void>;
  onVerifyCost?: (costId: number, decision: "APPROVED" | "REJECTED", rejectionReason?: string) => Promise<void>;
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
      ? accessiblePrograms.find((p) => p.id === selectedProgramId) ?? accessiblePrograms[0]
      : programs.find((p) => p.id === selectedProgramId) ?? programs[0]);

  const isLocked = program?.status === "Selesai Dikerjakan";

  // Verification state (Admin only)
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

  // Fetch progress and costs when program changes (Admin only)
  useEffect(() => {
    if (currentUser.role !== "Admin" || !program || !onVerifyProgress || !onVerifyCost) return;

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
        const msg = err instanceof Error ? err.message : "Gagal memuat data verifikasi";
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
      // Refetch data
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
      const msg = err instanceof Error ? err.message : `Gagal ${decision === "APPROVED" ? "menyetujui" : "menolak"}`;
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
  >(program?.status === "Selesai Dikerjakan" ? "Sedang Dikerjakan" : program?.status || "Sedang Dikerjakan");
  const [progressStage, setProgressStage] = useState("");
  const [realizationInput, setRealizationInput] = useState<string>("0");
  const [updateNote, setUpdateNote] = useState(program?.catatan || "");
  const [photos, setPhotos] = useState<File[]>([]);
  const [progressError, setProgressError] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setProgressError(`Hanya ${remainingSlots} foto yang dapat ditambahkan (maksimal 3 foto).`);
    } else {
      setProgressError("");
    }

    // Validasi tipe file
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const invalidFiles = filesToProcess.filter((f) => !allowedTypes.includes(f.type));
    if (invalidFiles.length > 0) {
      setProgressError("Tipe file tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validasi ukuran file (maksimal 2MB per file)
    const maxSize = 2 * 1024 * 1024;
    const oversizedFiles = filesToProcess.filter((f) => f.size > maxSize);
    if (oversizedFiles.length > 0) {
      setProgressError("Salah satu foto terlalu besar (maksimal 2MB per foto).");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setPhotos((prev) => [...prev, ...filesToProcess].slice(0, 3));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

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
    if (photos.length === 0) {
      setProgressError("Dokumentasi foto wajib diunggah minimal 1 foto (maksimal 3 foto).");
      return;
    }
    if (photos.length > 3) {
      setProgressError("Maksimal 3 foto dokumentasi lapangan.");
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
    // "Selesai Dikerjakan" tidak lagi tersedia di form progres;
    // status selesai hanya melalui aksi "Tandai Selesai" (handleTriggerMarkComplete)
    onSaveProgress({
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
      setProgressError("Dokumentasi foto wajib diunggah sebelum kegiatan ditandai selesai (maksimal 3 foto).");
      return;
    }
    if (program.realisasi < program.target) {
      setProgressError("Realisasi fisik belum mencapai target penuh (100%).");
      return;
    }

    onMarkComplete(program, true);
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

  // Helper to format status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DIAJUKAN":
        return (
          <Badge variant="warning" className="text-xs">
            <Clock className="w-3 h-3 mr-1" /> Diajukan
          </Badge>
        );
      case "DIVERIFIKASI":
        return (
          <Badge variant="success" className="text-xs">
            <CheckCircle className="w-3 h-3 mr-1" /> Disetujui
          </Badge>
        );
      case "DITOLAK":
        return (
          <Badge variant="danger" className="text-xs">
            <XIcon className="w-3 h-3 mr-1" /> Ditolak
          </Badge>
        );
      default:
        return <Badge variant="secondary" className="text-xs">{status}</Badge>;
    }
  };

  // Helper to format date
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

  // Helper to format currency
  const formatCurrency = (val: number | string | undefined) => {
    if (!val) return "Rp 0";
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(num);
  };

  // Progress verification list (Admin only)
  const renderProgressVerification = () => {
    if (currentUser.role !== "Admin" || !onVerifyProgress) return null;

    const pendingProgress = progressItems.filter((p) => p.status === "DIAJUKAN");

    return (
      <section className="bg-white rounded-2xl p-6 border border-[#E1E9F0] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[#143965] flex items-center gap-2">
            <Send className="w-5 h-5 text-[#1E4E8C]" />
            Verifikasi Laporan Progres
          </h3>
          {loadingProgress && <span className="text-xs text-[#65778B] animate-pulse">Memuat...</span>}
        </div>

        {pendingProgress.length === 0 && !loadingProgress && (
          <div className="text-center py-8 text-[#65778B] bg-[#F8FAFC] rounded-xl border border-[#E1E9F0]">
            Tidak ada laporan progres menunggu verifikasi.
          </div>
        )}

        {pendingProgress.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {pendingProgress.map((item: ProgressItem) => (
              <div
                key={item.id}
                className="bg-[#FBFDFE] border border-[#DFEAF0] rounded-xl p-4 hover:border-[#1E4E8C]/30 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[#143965]">
                        {item.tahap || "Tanpa tahap"}
                      </span>
                      {getStatusBadge(item.status)}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#65778B] flex-wrap">
                      <span>
                        <Calendar className="w-3.5 h-3.5 inline mr-1" />
                        {formatDate(item.tanggal)}
                      </span>
                      <span>
                        <Send className="w-3.5 h-3.5 inline mr-1" />
                        {typeof item.volume === "number" ? quantity(item.volume, item.satuan) : "-"}
                      </span>
                      {item.reportedBy && (
                        <span>
                          <ImageIcon className="w-3.5 h-3.5 inline mr-1" />
                          {item.reportedBy.nama || "Operator"}
                        </span>
                      )}
                    </div>
                    {item.catatan && (
                      <p className="text-xs text-[#65778B] bg-white rounded-lg p-2 border border-[#E1E9F0] mt-1">
                        {item.catatan}
                      </p>
                    )}
                    {item.rejectionReason && (
                      <p className="text-xs text-[#C44C3B] bg-[#FDEDED] rounded-lg p-2 border border-[#FAD1D1] mt-1">
                        <strong>Alasan penolakan: </strong>
                        {item.rejectionReason}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleVerifyOpen("progress", item.id, "APPROVED")}
                      disabled={loadingProgress}
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> Setujui
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleVerifyOpen("progress", item.id, "REJECTED")}
                      disabled={loadingProgress}
                    >
                      <XIcon className="w-3.5 h-3.5 mr-1" /> Tolak
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {progressItems.length > 0 && (
          <details className="mt-4 group">
            <summary className="cursor-pointer text-xs text-[#65778B] font-medium hover:text-[#1E4E8C] flex items-center gap-1">
              <span>Riwayat Verifikasi Progres ({progressItems.length})</span>
              <Clock className="w-3.5 h-3.5" />
            </summary>
            <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
              {progressItems
                .filter((item: ProgressItem) => item.status !== "DIAJUKAN")
                .sort((a: ProgressItem, b: ProgressItem) =>
                  new Date(b.verifiedAt || "").getTime() - new Date(a.verifiedAt || "").getTime()
                )
                .map((item: ProgressItem) => (
                  <div
                    key={item.id}
                    className="bg-[#FBFDFE] border border-[#DFEAF0] rounded-xl p-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-[#143965]">
                          {item.tahap || "Tanpa tahap"}
                        </span>
                        {getStatusBadge(item.status)}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-[#65778B] flex-wrap">
                        <span>
                          <Calendar className="w-3 h-3 inline mr-0.5" />
                          {formatDate(item.tanggal)}
                        </span>
                        {item.verifiedBy && (
                          <span>
                            <CheckCircle className="w-3 h-3 inline mr-0.5 text-[#258050]" />
                            {item.verifiedBy.nama || "Admin"}
                          </span>
                        )}
                        {item.verifiedAt && (
                          <span>
                            <Clock className="w-3 h-3 inline mr-0.5" />
                            {formatDate(item.verifiedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    {item.rejectionReason && (
                      <p className="text-[11px] text-[#C44C3B] bg-[#FDEDED] rounded-lg p-2 border border-[#FAD1D1] mt-2">
                        <strong>Alasan penolakan: </strong>
                        {(item.rejectionReason as string)}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </details>
        )}
      </section>
    );
  };

  // Cost verification list (Admin only)
  const renderCostVerification = () => {
    if (currentUser.role !== "Admin" || !onVerifyCost) return null;

    const pendingCosts = costItems.filter((c) => c.status === "DIAJUKAN");

    return (
      <section className="bg-white rounded-2xl p-6 border border-[#E1E9F0] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[#143965] flex items-center gap-2">
            <FileDown className="w-5 h-5 text-[#1E4E8C]" />
            Verifikasi Laporan Biaya
          </h3>
          {loadingCosts && <span className="text-xs text-[#65778B] animate-pulse">Memuat...</span>}
        </div>

        {pendingCosts.length === 0 && !loadingCosts && (
          <div className="text-center py-8 text-[#65778B] bg-[#F8FAFC] rounded-xl border border-[#E1E9F0]">
            Tidak ada laporan biaya menunggu verifikasi.
          </div>
        )}

        {pendingCosts.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {pendingCosts.map((item: CostItem) => (
              <div
                key={item.id}
                className="bg-[#FBFDFE] border border-[#DFEAF0] rounded-xl p-4 hover:border-[#1E4E8C]/30 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[#143965]">
                        {item.uraian || "Tanpa uraian"}
                      </span>
                      {getStatusBadge(item.status)}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#65778B] flex-wrap">
                      <span>
                        <Calendar className="w-3.5 h-3.5 inline mr-1" />
                        {formatDate(item.tanggal)}
                      </span>
                      <span className="font-medium text-[#E78A31]">
                        {formatCurrency(item.nominal)}
                      </span>
                      {item.inputBy && (
                        <span>
                          <ImageIcon className="w-3.5 h-3.5 inline mr-1" />
                          {item.inputBy.nama || "Operator"}
                        </span>
                      )}
                    </div>
                    {item.keterangan && (
                      <p className="text-xs text-[#65778B] bg-white rounded-lg p-2 border border-[#E1E9F0] mt-1">
                        {item.keterangan}
                      </p>
                    )}
                    {item.rejectionReason && (
                      <p className="text-xs text-[#C44C3B] bg-[#FDEDED] rounded-lg p-2 border border-[#FAD1D1] mt-1">
                        <strong>Alasan penolakan: </strong>
                        {item.rejectionReason}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleVerifyOpen("cost", item.id, "APPROVED")}
                      disabled={loadingCosts}
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> Setujui
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleVerifyOpen("cost", item.id, "REJECTED")}
                      disabled={loadingCosts}
                    >
                      <XIcon className="w-3.5 h-3.5 mr-1" /> Tolak
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {costItems.length > 0 && (
          <details className="mt-4 group">
            <summary className="cursor-pointer text-xs text-[#65778B] font-medium hover:text-[#1E4E8C] flex items-center gap-1">
              <span>Riwayat Verifikasi Biaya ({costItems.length})</span>
              <Clock className="w-3.5 h-3.5" />
            </summary>
            <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
              {costItems
                .filter((item: CostItem) => item.status !== "DIAJUKAN")
                .sort((a: CostItem, b: CostItem) =>
                  new Date(b.verifiedAt || "").getTime() - new Date(a.verifiedAt || "").getTime()
                )
                .map((item: CostItem) => (
                  <div
                    key={item.id}
                    className="bg-[#FBFDFE] border border-[#DFEAF0] rounded-xl p-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-[#143965]">
                          {item.uraian || "Tanpa uraian"}
                        </span>
                        {getStatusBadge(item.status)}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-[#65778B] flex-wrap">
                        <span>
                          <Calendar className="w-3 h-3 inline mr-0.5" />
                          {formatDate(item.tanggal)}
                        </span>
                        <span className="font-medium text-[#E78A31]">
                          {formatCurrency(item.nominal)}
                        </span>
                        {item.verifiedBy && (
                          <span>
                            <CheckCircle className="w-3 h-3 inline mr-0.5 text-[#258050]" />
                            {item.verifiedBy.nama || "Admin"}
                          </span>
                        )}
                        {item.verifiedAt && (
                          <span>
                            <Clock className="w-3 h-3 inline mr-0.5" />
                            {formatDate(item.verifiedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    {item.rejectionReason && (
                      <p className="text-[11px] text-[#C44C3B] bg-[#FDEDED] rounded-lg p-2 border border-[#FAD1D1] mt-2">
                        <strong>Alasan penolakan: </strong>
                        {item.rejectionReason}
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </details>
        )}
      </section>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top action */}
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
          Atur jadwal, target, progres, dan dokumentasi lapangan kegiatan yang ditugaskan kepada Anda.
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
            <strong className="text-[#143965] ml-1">{program.operatorPengelola || "Belum Ditugaskan"}</strong>
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
                <Input
                  label="Tanggal Update"
                  type="date"
                  value={updateDate}
                  onChange={(e) => setUpdateDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <Select
                  label="Status Pekerjaan"
                  value={progressStatus}
                  onChange={(e) =>
                    setProgressStatus(
                      e.target.value as "Belum Dikerjakan" | "Sedang Dikerjakan"
                    )
                  }
                  required
                >
                  <option value="Belum Dikerjakan">Belum Dikerjakan</option>
                  <option value="Sedang Dikerjakan">Sedang Dikerjakan</option>
                </Select>
              </div>

              <div>
                <Input
                  label="Tahap Pekerjaan Lapangan"
                  type="text"
                  value={progressStage}
                  onChange={(e) => setProgressStage(e.target.value)}
                  placeholder="Contoh: Penghamparan agregat ruas kedua"
                  required
                />
              </div>

              <div>
                <Input
                  label={`Tambahan Capaian (${formatUnitSymbol(program.satuan)})`}
                  type="number"
                  step="any"
                  min="0"
                  value={realizationInput}
                  onChange={(e) => setRealizationInput(e.target.value)}
                  className="font-semibold"
                  required
                />
              </div>
            </div>

            <div>
              <Input
                label="Keterangan / Catatan Teknis"
                type="text"
                value={updateNote}
                onChange={(e) => setUpdateNote(e.target.value)}
                placeholder="Keterangan hasil pekerjaan hari ini..."
                required
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

              {/* Photo Previews */}
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
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute top-1.5 right-1.5 bg-red-600/90 text-white p-1 rounded-full hover:bg-red-700 transition shadow-xs"
                        title="Hapus foto ini"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Input & Trigger */}
              {photos.length < 3 ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFilesSelect}
                    className="w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-xs bg-white file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#E8F2F8] file:text-[#1E4E8C]"
                  />
                  <p className="text-[11px] text-[#65778B] mt-1">
                    Format didukung: JPG, PNG, WEBP. Anda dapat mengunggah hingga 3 foto sekaligus (tersisa {3 - photos.length} slot).
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

      {/* Verification Sections (Admin only) */}
      {currentUser.role === "Admin" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderProgressVerification()}
          {renderCostVerification()}
        </div>
      )}

      {/* Verification Dialog */}
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
        confirmLabel={verifyDialog?.decision === "APPROVED" ? "Ya, Setujui" : "Tolak"}
      />
    </div>
  );
};