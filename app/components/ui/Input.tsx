"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export function Input({
  label,
  error,
  helper,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        className={`w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1E4E8C]/20 transition ${
          error ? "border-[#BD493B]" : ""
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-[10px] text-[#BD493B] font-semibold leading-tight">
          {error}
        </p>
      )}
      {helper && !error && (
        <p className="text-[10px] text-[#65778B] leading-tight">{helper}</p>
      )}
    </div>
  );
}

export function Select({
  label,
  error,
  helper,
  className = "",
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string; helper?: string }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-xs font-bold text-[#35536F] uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        className={`w-full border border-[#CCD9E4] rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1E4E8C]/20 transition ${
          error ? "border-[#BD493B]" : ""
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-[10px] text-[#BD493B] font-semibold leading-tight">
          {error}
        </p>
      )}
      {helper && !error && (
        <p className="text-[10px] text-[#65778B] leading-tight">{helper}</p>
      )}
    </div>
  );
}
