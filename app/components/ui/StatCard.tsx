"use client";

import React from "react";
import { currency } from "../../utils/helpers";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: "blue" | "orange" | "green" | "teal" | "red";
}

const colorStyles: Record<string, string> = {
  blue: "bg-[#1E4E8C] text-white",
  orange: "bg-[#BD493B] text-white",
  green: "bg-[#258050] text-white",
  teal: "bg-[#148B87] text-white",
  red: "bg-[#F44336] text-white",
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = "blue",
}: StatCardProps) {
  return (
    <article className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E1E9F0] shadow-xs card-indicator">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-[#65778B] m-0 uppercase tracking-wider">
            {title}
          </p>
          <strong className={`block text-2xl font-bold text-[#143965] mt-1.5 ${colorStyles[color]}`}>
            {typeof value === "number" ? currency(value) : value}
          </strong>
        </div>
        {icon && <div className="ml-auto">{icon}</div>}
      </div>
      {subtitle && (
        <span className="text-[11px] text-[#65778B] block mt-1">{subtitle}</span>
      )}
    </article>
  );
}
