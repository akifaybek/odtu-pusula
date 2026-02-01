"use client";

import Link from "next/link";
import { Compass, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { TakeAgainProgress } from "./TakeAgainBadge";

// Bölüm renkleri
const departmentColors: Record<string, string> = {
  CENG: "border-blue-500 bg-blue-500/10",
  EE: "border-yellow-500 bg-yellow-500/10",
  ME: "border-orange-500 bg-orange-500/10",
  IE: "border-purple-500 bg-purple-500/10",
  CE: "border-gray-500 bg-gray-500/10",
  CHE: "border-pink-500 bg-pink-500/10",
  MATH: "border-indigo-500 bg-indigo-500/10",
  PHYS: "border-cyan-500 bg-cyan-500/10",
  CHEM: "border-rose-500 bg-rose-500/10",
  STAT: "border-teal-500 bg-teal-500/10",
  BA: "border-emerald-500 bg-emerald-500/10",
  ECON: "border-lime-500 bg-lime-500/10",
  ARCH: "border-amber-500 bg-amber-500/10",
  ID: "border-fuchsia-500 bg-fuchsia-500/10",
  PSY: "border-violet-500 bg-violet-500/10",
  DEFAULT: "border-primary bg-primary/10",
};

const departmentBadgeColors: Record<string, string> = {
  CENG: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  EE: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  ME: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  IE: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  CE: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  CHE: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  MATH: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  PHYS: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  CHEM: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  STAT: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  BA: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  ECON: "bg-lime-500/10 text-lime-400 border-lime-500/20",
  ARCH: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  ID: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
  PSY: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  DEFAULT: "bg-primary/10 text-primary border-primary/20",
};

interface ProfessorCardProps {
  id: string;
  name: string;
  title: string; // "Prof. Dr." | "Doç. Dr." | "Dr. Öğr. Üyesi" | "Araş. Gör."
  department: string;
  rating: number;
  takeAgainPercent: number;
  reviewCount: number;
  courses: string[]; // Course codes
}

export default function ProfessorCard({
  id,
  name,
  title,
  department,
  rating,
  takeAgainPercent,
  reviewCount,
  courses,
}: ProfessorCardProps) {
  const avatarColor = departmentColors[department] || departmentColors.DEFAULT;
  const badgeColor = departmentBadgeColors[department] || departmentBadgeColors.DEFAULT;
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const displayedCourses = courses.slice(0, 3);
  const remainingCount = courses.length - 3;

  return (
    <Link href={`/hocalar/${id}`}>
      <div
        className={cn(
          "group bg-card border border-border/50 rounded-xl p-5",
          "hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30",
          "transition-all duration-300 cursor-pointer"
        )}
      >
        {/* Üst - Avatar ve bilgiler */}
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div
            className={cn(
              "w-16 h-16 rounded-full border-2 flex items-center justify-center flex-shrink-0",
              avatarColor
            )}
          >
            <span className="text-xl font-bold text-foreground">{initials}</span>
          </div>

          {/* Bilgiler */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground">{title}</p>
            <div
              className={cn(
                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border mt-1.5",
                badgeColor
              )}
            >
              {department}
            </div>
          </div>

          {/* Puan */}
          <div className="text-right flex-shrink-0">
            <div className="flex items-center gap-1">
              <Compass className="h-5 w-5 text-primary fill-primary/20" />
              <span className="text-2xl font-bold text-foreground">{rating.toFixed(1)}</span>
            </div>
            <span className="text-xs text-muted-foreground">/5</span>
          </div>
        </div>

        {/* Tekrar Alırım */}
        <div className="mb-4">
          <TakeAgainProgress percentage={takeAgainPercent} />
        </div>

        {/* Verdiği Dersler */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {displayedCourses.map((course) => (
            <span
              key={course}
              className="px-2 py-0.5 rounded-md bg-muted text-xs font-medium text-foreground"
            >
              {course}
            </span>
          ))}
          {remainingCount > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-muted/50 text-xs text-muted-foreground">
              +{remainingCount} ders daha
            </span>
          )}
        </div>

        {/* Yorum sayısı */}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground pt-3 border-t border-border/50">
          <MessageSquare className="h-4 w-4" />
          <span>{reviewCount} öğrenci yorumu</span>
        </div>
      </div>
    </Link>
  );
}
