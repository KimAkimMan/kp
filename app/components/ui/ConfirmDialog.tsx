"use client";

import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
  confirmLabel: string;
  showReasonInput?: boolean;
  reasonPlaceholder?: string;
}

export function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Ya, Lanjutkan",
  showReasonInput = false,
  reasonPlaceholder = "Masukkan alasan...",
}: ConfirmDialogProps) {
  const [reason, setReason] = useState("");

  if (!open) return null;

  const handleConfirm = () => {
    onConfirm(showReasonInput ? reason.trim() : undefined);
    setReason("");
  };

  const handleCancel = () => {
    setReason("");
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B2540]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-[#DCE5ED] animate-in fade-in zoom-in">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FDEEED] text-[#BD493B] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#143965]">{title}</h3>
            <p className="text-sm text-[#65778B] mt-1">{message}</p>
          </div>
        </div>
        {showReasonInput && (
          <div className="mt-4">
            <label htmlFor="confirm-dialog-reason" className="sr-only">
              Alasan penolakan
            </label>
            <textarea
              id="confirm-dialog-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={reasonPlaceholder}
              className="w-full px-3 py-2 border border-[#CCD9E4] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#143965]/20 focus:border-[#143965] resize-none"
              rows={3}
              autoFocus
            />
            <p className="mt-1 text-xs text-[#65778B]">Alasan penolakan wajib diisi.</p>
          </div>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-lg text-xs font-bold text-[#65778B] hover:bg-[#F4F7FA] transition"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={showReasonInput && !reason.trim()}
            className="px-5 py-2 rounded-lg text-xs font-bold bg-[#143965] text-white hover:bg-[#0E2849] transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
