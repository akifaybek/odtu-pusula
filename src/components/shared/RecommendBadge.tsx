"use client";

import { ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecommendBadgeProps {
  wouldRecommend: boolean | null;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function RecommendBadge({
  wouldRecommend,
  size = "md",
  showLabel = true,
}: RecommendBadgeProps) {
  if (wouldRecommend === null || wouldRecommend === undefined) {
    return null;
  }

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        sizeClasses[size],
        wouldRecommend
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
          : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
      )}
    >
      {wouldRecommend ? (
        <ThumbsUp className={iconSizes[size]} />
      ) : (
        <ThumbsDown className={iconSizes[size]} />
      )}
      {showLabel && (
        <span>{wouldRecommend ? "Tavsiye Ediyor" : "Tavsiye Etmiyor"}</span>
      )}
    </div>
  );
}
