"use client";

import Link from "next/link";
import { Compass, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import DifficultyBadge, { getDifficultyFromScore } from "@/components/shared/DifficultyBadge";

// Bölüm renkleri
const departmentColors: Record<string, string> = {
  CENG: "bg-blue-500",
  EE: "bg-yellow-500",
  ME: "bg-orange-500",
  IE: "bg-purple-500",
  CE: "bg-gray-500",
  CHE: "bg-pink-500",
  MATH: "bg-indigo-500",
  PHYS: "bg-cyan-500",
  CHEM: "bg-rose-500",
  STAT: "bg-teal-500",
  BA: "bg-emerald-500",
  ECON: "bg-lime-500",
  ARCH: "bg-amber-500",
  ID: "bg-fuchsia-500",
  PSY: "bg-violet-500",
  DEFAULT: "bg-primary",
};

interface CourseCardProps {
  code: string;
  name: string;
  department: string;
  credits: number;
  difficulty: number;
  rating: number;
  reviewCount: number;
}

export default function CourseCard({
  code,
  name,
  department,
  credits,
  difficulty,
  rating,
  reviewCount,
}: CourseCardProps) {
  const deptColor = departmentColors[department] || departmentColors.DEFAULT;
  const difficultyLevel = getDifficultyFromScore(difficulty);

  // Pusula doluluk hesapla (5 üzerinden)
  const filledCompasses = Math.round(rating);

  return (
    <Link href={`/dersler/${code}`}>
      <div
        className={cn(
          "group relative bg-card border border-border/50 rounded-xl overflow-hidden",
          "hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30",
          "transition-all duration-300 cursor-pointer"
        )}
      >
        {/* Üst renkli şerit */}
        <div className={cn("h-1.5", deptColor)} />

        {/* Kredi badge - sağ üst köşe */}
        <div className="absolute top-4 right-4">
          <div className="px-2.5 py-1 rounded-full bg-muted text-xs font-semibold text-foreground">
            {credits} KR
          </div>
        </div>

        <div className="p-5">
          {/* Ders kodu */}
          <div className="text-2xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
            {code}
          </div>

          {/* Ders adı */}
          <h3 className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[2.5rem]">
            {name}
          </h3>

          {/* Zorluk göstergesi */}
          <div className="mb-4">
            <DifficultyBadge level={difficultyLevel} size="sm" />
          </div>

          {/* Alt bilgiler */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            {/* Pusula puanları */}
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Compass
                  key={i}
                  className={cn(
                    "h-4 w-4",
                    i <= filledCompasses ? "text-primary fill-primary/20" : "text-muted-foreground/30"
                  )}
                />
              ))}
              <span className="ml-1.5 text-sm font-medium text-foreground">
                {rating.toFixed(1)}
              </span>
            </div>

            {/* Yorum sayısı */}
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <Users className="h-3.5 w-3.5" />
              <span>{reviewCount} yolcu</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
