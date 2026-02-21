"use client";

import { Mic, Scale, DoorOpen, RefreshCw, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import TakeAgainBadge from "./TakeAgainBadge";

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

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  score: number;
  maxScore?: number;
  color: string;
}

function StatCard({ icon: Icon, label, score, maxScore = 5, color }: StatCardProps) {
  const percentage = (score / maxScore) * 100;

  return (
    <div className="bg-card border border-border/50 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={cn("p-2 rounded-lg", color)}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>

      <div className="text-3xl font-bold text-foreground mb-3">
        {score.toFixed(1)}
        <span className="text-lg text-muted-foreground font-normal">/{maxScore}</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color.replace("/10", ""))}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface MiniCourseCardProps {
  code: string;
  name: string;
  rating: number;
}

function MiniCourseCard({ code, name, rating }: MiniCourseCardProps) {
  return (
    <Link href={`/courses/${code.replace(" ", "-")}`}>
      <div className="min-w-[180px] bg-card border border-border/50 rounded-xl p-4 hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer group">
        <div className="font-semibold text-foreground group-hover:text-primary transition-colors mb-1">
          {code}
        </div>
        <div className="text-xs text-muted-foreground mb-3 line-clamp-1">{name}</div>
        <div className="flex items-center gap-1">
          <Compass className="h-4 w-4 text-primary fill-primary/20" />
          <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
        </div>
      </div>
    </Link>
  );
}

interface ProfessorProfileProps {
  professor: {
    id: string;
    name: string;
    title: string;
    department: string;
    email?: string;
  };
  stats: {
    overall: number;
    teaching: number; // Anlatım - Sahne Performansı
    grading: number; // Notlandırma - Adalet Ölçer
    accessibility: number; // Ulaşılabilirlik - Kapısı Açık mı?
    takeAgainPercent: number;
    reviewCount: number;
  };
  courses: Array<{
    code: string;
    name: string;
    rating: number;
  }>;
}

export default function ProfessorProfile({ professor, stats, courses }: ProfessorProfileProps) {
  const avatarColor = departmentColors[professor.department] || departmentColors.DEFAULT;
  const initials = professor.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const statCards = [
    {
      icon: Mic,
      label: "Sahne Performansı",
      score: stats.teaching,
      color: "bg-violet-500/10 text-violet-500",
    },
    {
      icon: Scale,
      label: "Adalet Ölçer",
      score: stats.grading,
      color: "bg-amber-500/10 text-amber-500",
    },
    {
      icon: DoorOpen,
      label: "Kapısı Açık mı?",
      score: stats.accessibility,
      color: "bg-cyan-500/10 text-cyan-500",
    },
    {
      icon: Compass,
      label: "Genel Puan",
      score: stats.overall,
      color: "bg-primary/10 text-primary",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row items-start gap-6 p-6 bg-card border border-border/50 rounded-2xl">
        {/* Avatar */}
        <div
          className={cn(
            "w-24 h-24 md:w-32 md:h-32 rounded-full border-4 flex items-center justify-center flex-shrink-0",
            avatarColor
          )}
        >
          <span className="text-3xl md:text-4xl font-bold text-foreground">{initials}</span>
        </div>

        {/* Bilgiler */}
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
            {professor.name}
          </h1>
          <p className="text-lg text-muted-foreground mb-2">{professor.title}</p>
          <p className="text-sm text-primary mb-3">{professor.department}</p>

          {professor.email && (
            <a
              href={`mailto:${professor.email}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {professor.email}
            </a>
          )}

          {/* Tekrar Alırım Badge */}
          <div className="mt-4">
            <TakeAgainBadge percentage={stats.takeAgainPercent} size="lg" />
          </div>
        </div>

        {/* Genel Puan */}
        <div className="flex flex-col items-center p-4 bg-primary/5 rounded-xl border border-primary/20">
          <Compass className="h-8 w-8 text-primary fill-primary/20 mb-2" />
          <div className="text-4xl font-bold text-foreground">{stats.overall.toFixed(1)}</div>
          <div className="text-sm text-muted-foreground">/5 puan</div>
          <div className="text-xs text-muted-foreground mt-1">{stats.reviewCount} yorum</div>
        </div>
      </div>

      {/* Stat Kartları */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Tekrar Alırım - Büyük Görsel */}
      <div className="bg-card border border-border/50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <RefreshCw className="h-5 w-5 text-emerald-500" />
          </div>
          <span className="font-medium text-foreground">Tekrar Alır mıydın?</span>
        </div>

        <div className="flex items-center gap-6">
          {/* Büyük yüzde */}
          <div className="text-5xl font-bold text-foreground">
            %{stats.takeAgainPercent}
          </div>

          {/* Progress bar */}
          <div className="flex-1">
            <div className="h-4 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  stats.takeAgainPercent >= 70
                    ? "bg-emerald-500"
                    : stats.takeAgainPercent >= 40
                    ? "bg-amber-500"
                    : "bg-red-500"
                )}
                style={{ width: `${stats.takeAgainPercent}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Almam</span>
              <span>Kesinlikle Alırım</span>
            </div>
          </div>
        </div>
      </div>

      {/* Verdiği Dersler */}
      {courses.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Verdiği Dersler</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {courses.map((course) => (
              <MiniCourseCard key={course.code} {...course} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
