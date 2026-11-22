"use client";

import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "secondary";
  size?: "sm" | "md";
  className?: string;
}

const variantStyles: Record<string, string> = {
  default: "bg-[#E8F2F8] text-[#1E4E8C]",
  success: "bg-[#E7F6ED] text-[#258050]",
  warning: "bg-[#FEF3E0] text-[#BD6C1E]",
  danger: "bg-[#FDEEED] text-[#BD493B]",
  info: "bg-[#EBF4FF] text-[#1E4E8C]",
  secondary: "bg-[#F4F7FA] text-[#65778B]",
};

const sizeStyles: Record<string, string> = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-1 text-[11px]",
};

export function Badge({
  children,
  variant = "default",
  size = "md",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-bold ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}
