"use client";

import React from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "outline" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  disabled?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles: Record<ButtonVariant, string> = {
    primary: "bg-[#1E4E8C] text-white hover:bg-[#143965]",
    secondary: "bg-[#E7F6ED] text-[#258050] hover:bg-[#D4EFE0] border border-[#BCE5CC]",
    danger: "bg-[#FDEEED] text-[#BD493B] hover:bg-[#F8C8C4] border border-[#F8C8C4]",
    outline: "bg-white text-[#1E4E8C] border border-[#CCD9E4] hover:bg-[#F4F7FA]",
    ghost: "bg-transparent text-[#65778B] hover:bg-[#F4F7FA]",
  };

  const sizeStyles: Record<string, string> = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="w-4 h-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938V12a6.962 6.962 0 006-6v4.291z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
}
