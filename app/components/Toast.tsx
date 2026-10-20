"use client";

import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface ToastProps {
  message: string | null;
  type?: "success" | "error";
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = "success",
  onClose,
}) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3400);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      role="status"
      className={`fixed right-6 bottom-6 z-50 flex items-center gap-2.5 px-4 py-3.5 rounded-xl text-white shadow-xl transition-all duration-200 animate-in fade-in slide-in-from-bottom-3 ${
        type === "error" ? "bg-[#9D3D32]" : "bg-[#173C67]"
      }`}
    >
      {type === "error" ? (
        <AlertCircle className="w-5 h-5 text-red-200 shrink-0" />
      ) : (
        <CheckCircle2 className="w-5 h-5 text-teal-300 shrink-0" />
      )}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};
