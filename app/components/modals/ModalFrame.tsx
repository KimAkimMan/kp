"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModalFrameProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const ModalFrame: React.FC<ModalFrameProps> = ({
  title,
  onClose,
  children,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-[#0B2540]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#DCE5ED]">
        <div className="flex items-center justify-between p-6 border-b border-[#EAF0F4]">
          <h2 className="text-xl font-bold text-[#143965]">{title}</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#65778B] hover:text-[#143965] hover:bg-[#F4F7FA] transition"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
