"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel: string;
}

export function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Ya, Lanjutkan",
}: ConfirmDialogProps) {
  if (!open) return null;

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
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-xs font-bold text-[#65778B] hover:bg-[#F4F7FA] transition"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-lg text-xs font-bold bg-[#143965] text-white hover:bg-[#0E2849] transition"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
