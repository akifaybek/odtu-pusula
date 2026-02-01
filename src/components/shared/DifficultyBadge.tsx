"use client";

import { cn } from "@/lib/utils";
import { Compass, Mountain, TrendingUp } from "lucide-react";

type DifficultyLevel = "easy" | "medium" | "hard";

interface DifficultyBadgeProps {
  level: DifficultyLevel;
  score?: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

const difficultyConfig = {
  easy: {
    label: "Kolay Rota",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    icon: TrendingUp,
  },
  medium: {
    label: "Orta Rota",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    icon: Compass,
  },
  hard: {
    label: "Zorlu Rota",
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    icon: Mountain,
  },
};

export function getDifficultyFromScore(score: number): DifficultyLevel {
  if (score <= 2.5) return "easy";
  if (score <= 3.5) return "medium";
  return "hard";
}

export default function DifficultyBadge({
  level,
  score,
  showLabel = true,
  size = "md",
}: DifficultyBadgeProps) {
  const config = difficultyConfig[level];
  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-1 gap-1",
    md: "text-sm px-3 py-1.5 gap-1.5",
    lg: "text-base px-4 py-2 gap-2",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full font-medium border",
        config.bg,
        config.border,
        config.color,
        sizeClasses[size]
      )}
    >
      <Icon className={iconSizes[size]} />
      {showLabel && <span>{config.label}</span>}
      {score !== undefined && (
        <span className="opacity-70">({score.toFixed(1)})</span>
      )}
    </div>
  );
}
