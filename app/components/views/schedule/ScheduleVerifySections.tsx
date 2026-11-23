"use client";

import React from "react";
import { Program, User } from "../../../types";
import { quantity } from "../../../utils/helpers";

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

interface ScheduleVerifySectionsProps {
  currentUser: User;
  program: Program | undefined;
  loadingProgress: boolean;
  loadingCosts: boolean;
  progressItems: Array<{
    id: number;
    tanggal: string;
    tahap: string;
    volume: number;
    satuan: string;
    status: string;
    rejectionReason: string | null;
    catatan: string | null;
    reportedBy?: { id: number; nama: string } | null;
    verifiedBy?: { id: number; nama: string } | null;
    verifiedAt?: string | null;
  }>;
  costItems: Array<{
    id: number;
    tanggal: string;
    uraian: string;
    nominal: number;
    status: string;
    rejectionReason: string | null;
    keterangan: string | null;
    inputBy?: { id: number; nama: string } | null;
    verifiedBy?: { id: number; nama: string } | null;
    verifiedAt?: string | null;
  }>;
  onVerifyOpen: (
    type: "progress" | "cost",
    itemId: number,
    decision: "APPROVED" | "REJECTED"
  ) => void;
  formatDate: (dateStr: string | undefined) => string;
}

const statusBadge = (status: string) => {
  switch (status) {
    case "DIAJUKAN":
      return (
        <span className="text-xs text-[#BD6C1E] flex items-center gap-1">
          <span className="w-3 h-3">⟲</span> Diajukan
        </span>
      );
    case "DIVERIFIKASI":
      return (
        <span className="text-xs text-[#258050] flex items-center gap-1">
          <span className="w-3 h-3">✓</span> Disetujui
        </span>
      );
    case "DITOLAK":
      return (
        <span className="text-xs text-[#BD493B] flex items-center gap-1">
          <span className="w-3 h-3">✗</span> Ditolak
        </span>
      );
    default:
      return <span className="text-xs">{status}</span>;
  }
};

export function ScheduleVerifySections({
  currentUser,
  program,
  loadingProgress,
  loadingCosts,
  progressItems,
  costItems,
  onVerifyOpen,
  formatDate,
}: ScheduleVerifySectionsProps) {
  if (currentUser.role !== "Admin") return null;

  const pendingProgress = progressItems.filter((p) => p.status === "DIAJUKAN");
  const pendingCosts = costItems.filter((c) => c.status === "DIAJUKAN");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <section className="bg-white rounded-2xl p-6 border border-[#E1E9F0] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[#143965] flex items-center gap-2">
            <span className="w-5 h-5 text-[#1E4E8C]">→</span>
            Verifikasi Laporan Progres
          </h3>
          {loadingProgress && (
            <span className="text-xs text-[#65778B] animate-pulse">Memuat...</span>
          )}
        </div>

        {pendingProgress.length === 0 && !loadingProgress && (
          <div className="text-center py-8 text-[#65778B] bg-[#F8FAFC] rounded-xl border border-[#E1E9F0]">
            Tidak ada laporan progres menunggu verifikasi.
          </div>
        )}

        {pendingProgress.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {pendingProgress.map((item) => (
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
                      {statusBadge(item.status)}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#65778B] flex-wrap">
                      <span>
                        <span className="w-3.5 h-3.5 inline mr-1">📅</span>{" "}
                        {formatDate(item.tanggal)}
                      </span>
                      <span>
                        <span className="w-3.5 h-3.5 inline mr-1">📤</span>{" "}
                        {typeof item.volume === "number"
                          ? quantity(item.volume, item.satuan)
                          : "-"}
                      </span>
                      {item.reportedBy && (
                        <span>
                          <span className="w-3.5 h-3.5 inline mr-1">👤</span>{" "}
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
                    <button
                      onClick={() =>
                        onVerifyOpen("progress", item.id, "APPROVED")
                      }
                      disabled={loadingProgress}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#258050] text-white hover:bg-[#1D6840] disabled:opacity-60 disabled:cursor-not-allowed transition shadow-xs flex items-center gap-1"
                    >
                      <span className="w-3.5 h-3.5">✓</span> Setujui
                    </button>
                    <button
                      onClick={() =>
                        onVerifyOpen("progress", item.id, "REJECTED")
                      }
                      disabled={loadingProgress}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#BD493B] text-white hover:bg-[#9B2C2C] disabled:opacity-60 disabled:cursor-not-allowed transition shadow-xs flex items-center gap-1"
                    >
                      <span className="w-3.5 h-3.5">✗</span> Tolak
                    </button>
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
              <span className="w-3.5 h-3.5">🕒</span>
            </summary>
            <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
              {progressItems
                .filter((item) => item.status !== "DIAJUKAN")
                .sort(
                  (a, b) =>
                    new Date(b.verifiedAt || "").getTime() -
                    new Date(a.verifiedAt || "").getTime()
                )
                .map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#FBFDFE] border border-[#DFEAF0] rounded-xl p-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-[#143965]">
                          {item.tahap || "Tanpa tahap"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-[#65778B] flex-wrap">
                        <span>
                          <span className="w-3 h-3 inline mr-0.5">📅</span>{" "}
                          {formatDate(item.tanggal)}
                        </span>
                        {item.verifiedBy && (
                          <span>
                            <span className="w-3 h-3 inline mr-0.5 text-[#258050]">
                              ✓
                            </span>{" "}
                            {item.verifiedBy.nama || "Admin"}
                          </span>
                        )}
                        {item.verifiedAt && (
                          <span>
                            <span className="w-3 h-3 inline mr-0.5">🕒</span>{" "}
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

      <section className="bg-white rounded-2xl p-6 border border-[#E1E9F0] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[#143965] flex items-center gap-2">
            <span className="w-5 h-5 text-[#1E4E8C]">⬇</span>
            Verifikasi Laporan Biaya
          </h3>
          {loadingCosts && (
            <span className="text-xs text-[#65778B] animate-pulse">Memuat...</span>
          )}
        </div>

        {pendingCosts.length === 0 && !loadingCosts && (
          <div className="text-center py-8 text-[#65778B] bg-[#F8FAFC] rounded-xl border border-[#E1E9F0]">
            Tidak ada laporan biaya menunggu verifikasi.
          </div>
        )}

        {pendingCosts.length > 0 && (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {pendingCosts.map((item) => (
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
                      {statusBadge(item.status)}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#65778B] flex-wrap">
                      <span>
                        <span className="w-3.5 h-3.5 inline mr-1">📅</span>{" "}
                        {formatDate(item.tanggal)}
                      </span>
                      <span className="font-medium text-[#E78A31]">
                        {formatCurrency(item.nominal)}
                      </span>
                      {item.inputBy && (
                        <span>
                          <span className="w-3.5 h-3.5 inline mr-1">👤</span>{" "}
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
                    <button
                      onClick={() => onVerifyOpen("cost", item.id, "APPROVED")}
                      disabled={loadingCosts}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#258050] text-white hover:bg-[#1D6840] disabled:opacity-60 disabled:cursor-not-allowed transition shadow-xs flex items-center gap-1"
                    >
                      <span className="w-3.5 h-3.5">✓</span> Setujui
                    </button>
                    <button
                      onClick={() => onVerifyOpen("cost", item.id, "REJECTED")}
                      disabled={loadingCosts}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#BD493B] text-white hover:bg-[#9B2C2C] disabled:opacity-60 disabled:cursor-not-allowed transition shadow-xs flex items-center gap-1"
                    >
                      <span className="w-3.5 h-3.5">✗</span> Tolak
                    </button>
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
              <span className="w-3.5 h-3.5">🕒</span>
            </summary>
            <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
              {costItems
                .filter((item) => item.status !== "DIAJUKAN")
                .sort(
                  (a, b) =>
                    new Date(b.verifiedAt || "").getTime() -
                    new Date(a.verifiedAt || "").getTime()
                )
                .map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#FBFDFE] border border-[#DFEAF0] rounded-xl p-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-[#143965]">
                          {item.uraian || "Tanpa uraian"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-[#65778B] flex-wrap">
                        <span>
                          <span className="w-3 h-3 inline mr-0.5">📅</span>{" "}
                          {formatDate(item.tanggal)}
                        </span>
                        <span className="font-medium text-[#E78A31]">
                          {formatCurrency(item.nominal)}
                        </span>
                        {item.verifiedBy && (
                          <span>
                            <span className="w-3 h-3 inline mr-0.5 text-[#258050]">
                              ✓
                            </span>{" "}
                            {item.verifiedBy.nama || "Admin"}
                          </span>
                        )}
                        {item.verifiedAt && (
                          <span>
                            <span className="w-3 h-3 inline mr-0.5">🕒</span>{" "}
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
    </div>
  );
}
