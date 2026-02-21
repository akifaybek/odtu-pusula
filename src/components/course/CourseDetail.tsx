"use client";

import { Compass, BarChart3, Clock, BookOpen, ChevronRight, Star, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import GradeDistribution from "./GradeDistribution";

interface ScoreCardProps {
  icon: React.ElementType;
  label: string;
  score: number;
  maxScore?: number;
  color: string;
}

function ScoreCard({ icon: Icon, label, score, maxScore = 5, color }: ScoreCardProps) {
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

interface ProfessorCardProps {
  id: string;
  name: string;
  title: string;
  rating: number;
  reviewCount: number;
}

function ProfessorCard({ id, name, title, rating, reviewCount }: ProfessorCardProps) {
  return (
    <Link href={`/professors/${id}`}>
      <div className="min-w-[200px] bg-card border border-border/50 rounded-xl p-4 hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer group">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg font-bold text-primary">
              {name.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
              {name}
            </div>
            <div className="text-xs text-muted-foreground">{title}</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Compass className="h-4 w-4 text-primary fill-primary/20" />
            <span className="font-medium text-foreground">{rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({reviewCount})</span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    </Link>
  );
}

interface CourseDetailProps {
  course: {
    code: string;
    name: string;
    department: string | { code: string; name: string };
    credits: number;
    description?: string | null;
  };
  stats: {
    overall: number;
    difficulty: number;
    workload: number;
    usefulness: number;
    reviewCount: number;
    recommendPercent?: number;
  };
  gradeDistribution?: Record<string, number>;
  professors: Array<{
    id: string;
    name: string;
    title: string;
    rating: number;
    reviewCount: number;
  }>;
}

export default function CourseDetail({ course, stats, gradeDistribution, professors }: CourseDetailProps) {
  const scoreCards = [
    {
      icon: BarChart3,
      label: "Zorluk Seviyesi",
      score: stats.difficulty,
      color: "bg-red-500/10 text-red-500",
    },
    {
      icon: Clock,
      label: "İş Yükü",
      score: stats.workload,
      color: "bg-amber-500/10 text-amber-500",
    },
    {
      icon: BookOpen,
      label: "Fayda Düzeyi",
      score: stats.usefulness,
      color: "bg-emerald-500/10 text-emerald-500",
    },
    {
      icon: Star,
      label: "Genel Puan",
      score: stats.overall,
      color: "bg-primary/10 text-primary",
    },
  ];

  // Grade distribution için grades array oluştur
  const gradesArray: string[] = [];
  if (gradeDistribution) {
    Object.entries(gradeDistribution).forEach(([grade, count]) => {
      for (let i = 0; i < count; i++) {
        gradesArray.push(grade);
      }
    });
  }

  return (
    <div className="space-y-8">
      <h2 className="sr-only">{course.code} - {course.name}</h2>
      {/* Tavsiye Oranı */}
      {stats.recommendPercent !== undefined && stats.recommendPercent > 0 && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
          <div className="p-2 rounded-lg bg-emerald-500/20">
            <ThumbsUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              %{stats.recommendPercent}
            </span>
            <span className="text-sm text-muted-foreground ml-2">
              öğrenci bu dersi tavsiye ediyor
            </span>
          </div>
        </div>
      )}

      {/* Puan Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {scoreCards.map((card) => (
          <ScoreCard key={card.label} {...card} />
        ))}
      </div>

      {/* Not Dağılımı */}
      {gradesArray.length > 0 && <GradeDistribution grades={gradesArray} />}

      {/* Bu Dersi Verenler */}
      {professors.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Bu Dersi Verenler
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {professors.map((prof) => (
              <ProfessorCard key={prof.id} {...prof} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
