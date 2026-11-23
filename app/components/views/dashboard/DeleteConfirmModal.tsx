"use client";

import React from "react";

interface DeleteConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
  confirmLabel: string;
}

export function DeleteConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  isDeleting,
  confirmLabel,
}: DeleteConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl border border-[#E1E9F0]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-[#FDEEED] text-[#BD493B] flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
          <h3 className="text-base font-bold text-[#143965]">{title}</h3>
        </div>
        <p className="text-sm text-[#65778B] mb-5">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            disabled={isDeleting}
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#F0F4F8] text-[#35536F] hover:bg-[#E1E9F0] transition disabled:opacity-60"
          >
            Batal
          </button>
          <button
            disabled={isDeleting}
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-[#BD493B] text-white hover:bg-[#9E3B2F] transition disabled:opacity-60"
          >
            {isDeleting ? "Menghapus..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
