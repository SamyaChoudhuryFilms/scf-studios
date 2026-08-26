import React from 'react';

export default function Badge({ children, variant = "default", className = "" }) {
  const styles = {
    default: "bg-white/10 text-text-secondary border-white/5",
    accent: "bg-brand-accent/25 text-brand-accent border-brand-accent/30",
    success: "bg-emerald-500/25 text-emerald-400 border-emerald-500/30",
    warning: "bg-yellow-500 text-white border-transparent",
    danger: "bg-red-500/25 text-red-400 border-red-500/30",
    premium: "bg-red-600 text-white border-transparent font-bold",
    original: "bg-red-600 text-white font-extrabold uppercase border-transparent",
  };

  // Check if custom text size or padding is provided to avoid Tailwind conflict issues
  const hasCustomText = className.includes('text-');
  const hasCustomPadding = className.includes('p-') || className.includes('px-') || className.includes('py-');

  const baseText = hasCustomText ? "" : "text-[10px] font-semibold";
  const basePadding = hasCustomPadding ? "" : "px-2.5 py-0.5";

  return (
    <span className={`inline-flex items-center rounded tracking-wide border uppercase ${baseText} ${basePadding} ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}
