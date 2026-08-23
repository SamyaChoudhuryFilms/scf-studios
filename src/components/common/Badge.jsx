import React from 'react';

export default function Badge({ children, variant = "default", className = "" }) {
  const styles = {
    default: "bg-white/10 text-text-secondary border-white/5",
    accent: "bg-brand-accent/25 text-brand-accent border-brand-accent/30",
    success: "bg-emerald-500/25 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/25 text-amber-400 border-amber-500/30",
    danger: "bg-red-500/25 text-red-400 border-red-500/30",
    premium: "bg-brand-accent/20 text-brand-accent border-brand-accent/30 font-bold",
    original: "bg-brand-accent text-white font-extrabold uppercase border-transparent",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-semibold tracking-wide border uppercase ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
}
