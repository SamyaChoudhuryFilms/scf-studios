import React from 'react';

export default function Skeleton({ className = "", variant = "card" }) {
  const getVariantStyles = () => {
    switch (variant) {
      case "text":
        return "h-4 w-full rounded";
      case "title":
        return "h-6 w-3/4 rounded-md";
      case "circle":
        return "rounded-full";
      case "card":
        return "aspect-[16/9] w-full rounded-lg";
      case "short":
        return "aspect-[9/16] w-full rounded-lg";
      case "hero":
        return "h-[65vh] w-full rounded-xl";
      default:
        return "rounded";
    }
  };

  return (
    <div className={`bg-card-bg/40 animate-pulse border border-white/5 ${getVariantStyles()} ${className}`}></div>
  );
}

export function MovieRailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton variant="title" className="w-48" />
      <div className="flex gap-4 overflow-x-hidden">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Skeleton key={i} variant="card" className="w-52 md:w-64 flex-shrink-0" />
        ))}
      </div>
    </div>
  );
}

export function ShortRailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton variant="title" className="w-32" />
      <div className="flex gap-4 overflow-x-hidden">
        {[1, 2, 3, 4, 5, 6, 7].map(i => (
          <Skeleton key={i} variant="short" className="w-32 md:w-40 flex-shrink-0" />
        ))}
      </div>
    </div>
  );
}

export function CreatorRailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton variant="title" className="w-40" />
      <div className="flex gap-4 overflow-x-hidden">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex-shrink-0 w-32 flex flex-col items-center gap-2">
            <Skeleton variant="circle" className="w-20 h-20" />
            <Skeleton variant="text" className="w-16 h-3" />
          </div>
        ))}
      </div>
    </div>
  );
}
