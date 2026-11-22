"use client";

import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export function Card({
  children,
  className = "",
  header,
  footer,
}: CardProps) {
  return (
    <div className={`bg-white rounded-2xl border border-[#E1E9F0] shadow-xs ${className}`}>
      {header && <div className="p-4 border-b border-[#EAF0F4]">{header}</div>}
      <div className="p-4">{children}</div>
      {footer && <div className="p-4 border-t border-[#EAF0F4] bg-[#F8FAFC]">{footer}</div>}
    </div>
  );
}

export function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="p-4">{children}</div>;
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="p-4 border-b border-[#EAF0F4]">{children}</div>;
}

export function CardFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 border-t border-[#EAF0F4] bg-[#F8FAFC]">{children}</div>
  );
}
