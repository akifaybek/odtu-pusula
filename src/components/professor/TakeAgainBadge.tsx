"use client";

import { cn } from "@/lib/utils";
import { ThumbsUp, ThumbsDown, Minus } from "lucide-react";

type TakeAgainLevel = "recommended" | "mixed" | "not-recommended";

interface TakeAgainBadgeProps {
  percentage: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

function getTakeAgainLevel(percentage: number): TakeAgainLevel {
  if (percentage >= 70) return "recommended";
  if (percentage >= 40) return "mixed";
  return "not-recommended";
}

const takeAgainConfig = {
  recommended: {
    label: "Tavsiye Ediliyor",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    progressBg: "bg-emerald-500",
    icon: ThumbsUp,
  },
  mixed: {
    label: "Kararsız Kitle",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    progressBg: "bg-amber-500",
    icon: Minus,
  },
  "not-recommended": {
    label: "Düşün Derim",
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    progressBg: "bg-red-500",
    icon: ThumbsDown,
  },
};

export default function TakeAgainBadge({
  percentage,
  showLabel = true,
  size = "md",
}: TakeAgainBadgeProps) {
  const level = getTakeAgainLevel(percentage);
  const config = takeAgainConfig[level];
  const Icon = config.icon;

  const sizeClasses = {
    sm: {
      container: "text-xs px-2 py-1 gap-1",
      icon: "h-3 w-3",
    },
    md: {
      container: "text-sm px-3 py-1.5 gap-1.5",
      icon: "h-4 w-4",
    },
    lg: {
      container: "text-base px-4 py-2 gap-2",
      icon: "h-5 w-5",
    },
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full font-medium border",
        config.bg,
        config.border,
        config.color,
        sizeClasses[size].container
      )}
    >
      <Icon className={sizeClasses[size].icon} />
      <span className="font-bold">%{percentage}</span>
      {showLabel && <span className="opacity-80">· {config.label}</span>}
    </div>
  );
}

// Progress bar version for cards
interface TakeAgainProgressProps {
  percentage: number;
  showLabel?: boolean;
}

export function TakeAgainProgress({ percentage, showLabel = true }: TakeAgainProgressProps) {
  const level = getTakeAgainLevel(percentage);
  const config = takeAgainConfig[level];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Tekrar Alırım</span>
        <span className={cn("font-semibold", config.color)}>
          %{percentage}
          {showLabel && <span className="font-normal opacity-70"> · {config.label}</span>}
        </span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", config.progressBg)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export { getTakeAgainLevel, takeAgainConfig };
