"use client";

import { cn } from "@/lib/utils";
import { BookOpen, Star, Sparkles, Palette, Coffee } from "lucide-react";

type CourseType = "REQUIRED" | "ELECTIVE" | "TECH_ELECTIVE" | "NON_TECH" | "FREE_ELECTIVE";

interface CourseTypeBadgeProps {
  type: CourseType | null | undefined;
  size?: "sm" | "md";
}

const typeConfig: Record<CourseType, { label: string; labelEn: string; icon: React.ElementType; color: string }> = {
  REQUIRED: {
    label: "Zorunlu",
    labelEn: "Required",
    icon: BookOpen,
    color: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  },
  ELECTIVE: {
    label: "Seçmeli",
    labelEn: "Elective",
    icon: Star,
    color: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400",
  },
  TECH_ELECTIVE: {
    label: "Teknik Seçmeli",
    labelEn: "Technical Elective",
    icon: Sparkles,
    color: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
  },
  NON_TECH: {
    label: "Teknik Dışı",
    labelEn: "Non-Technical",
    icon: Palette,
    color: "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400",
  },
  FREE_ELECTIVE: {
    label: "Serbest Seçmeli",
    labelEn: "Free Elective",
    icon: Coffee,
    color: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  },
};

export default function CourseTypeBadge({ type, size = "md" }: CourseTypeBadgeProps) {
  if (!type) return null;

  const config = typeConfig[type];
  if (!config) return null;

  const Icon = config.icon;

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        sizeClasses[size],
        config.color
      )}
    >
      <Icon className={iconSizes[size]} />
      <span>{config.label}</span>
    </div>
  );
}
