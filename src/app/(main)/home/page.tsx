"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  BookOpen,
  Users,
  TrendingUp,
  Star,
  ArrowRight,
  Compass,
  PenLine,
  Clock,
  Award,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/contexts/LanguageContext";

interface HomeStats {
  totalCourses: number;
  totalProfessors: number;
  totalReviews: number;
  totalUsers: number;
}

interface RecentReview {
  id: string;
  type: "course" | "professor";
  code: string;
  name: string;
  rating: number;
  comment: string;
  author: string;
  time: string;
}

interface TopCourse {
  id: string;
  code: string;
  name: string;
  reviews: number;
}

interface TopProfessor {
  id: string;
  name: string;
  title: string;
  dept: string;
  rating: number;
  reviews: number;
}

interface HomeData {
  stats: HomeStats;
  recentReviews: RecentReview[];
  topCourses: TopCourse[];
  topProfessors: TopProfessor[];
}

function HomeSkeleton() {
  return (
    <div className="space-y-10">
      {/* Welcome Banner Skeleton */}
      <Skeleton className="h-56 rounded-3xl" />

      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <Skeleton className="h-8 w-48" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function formatStatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}K+`;
  }
  return `${num}+`;
}

export default function HomePage() {
  const { data: session } = useSession();
  const { t } = useTranslation();
  const [data, setData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/home/stats")
      .then((res) => {
        if (!res.ok) throw new Error("Veriler yüklenemedi");
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <HomeSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="p-4 bg-destructive/10 rounded-full">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-destructive">{error || "Bir hata oluştu"}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Tekrar Dene
        </Button>
      </div>
    );
  }

  const { stats, recentReviews, topCourses, topProfessors } = data;

  return (
    <div className="space-y-10">
      {/* Welcome Banner - Deeper, less 'neon' gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#a41034] to-[#7a0c28] p-8 md:p-12 text-white shadow-2xl shadow-[#a41034]/20 group border border-white/10">

        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <Compass className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {t("home.welcome")}
                {session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}!
              </h1>
              <p className="text-white/70 text-sm">ODTU Pusula</p>
            </div>
          </div>

          <p className="text-white/80 max-w-2xl mb-6 leading-relaxed">
            {t("home.welcomeDescription")}
          </p>

          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-white text-[#a41034] hover:bg-white/90 rounded-full">
              <Link href="/courses">
                <BookOpen className="h-4 w-4 mr-2" />
                {t("home.browseCourses")}
              </Link>
            </Button>
            <Button asChild className="bg-white/20 text-white border-2 border-white hover:bg-white/30 rounded-full">
              <Link href="/professors">
                <Users className="h-4 w-4 mr-2" />
                {t("home.browseProfessors")}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-2xl p-5 border border-border/50 hover:shadow-lg transition-shadow">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {formatStatNumber(stats.totalCourses)}
          </div>
          <div className="text-sm text-muted-foreground">{t("home.stats.courses")}</div>
        </div>
        <div className="bg-card rounded-2xl p-5 border border-border/50 hover:shadow-lg transition-shadow">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-3">
            <Users className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {formatStatNumber(stats.totalProfessors)}
          </div>
          <div className="text-sm text-muted-foreground">{t("home.stats.professors")}</div>
        </div>
        <div className="bg-card rounded-2xl p-5 border border-border/50 hover:shadow-lg transition-shadow">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-3">
            <Star className="h-5 w-5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {formatStatNumber(stats.totalReviews)}
          </div>
          <div className="text-sm text-muted-foreground">{t("home.stats.reviews")}</div>
        </div>
        <div className="bg-card rounded-2xl p-5 border border-border/50 hover:shadow-lg transition-shadow">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            {formatStatNumber(stats.totalUsers)}
          </div>
          <div className="text-sm text-muted-foreground">{t("home.stats.activeUsers")}</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left - Recent Reviews */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              {t("home.recentReviews")}
            </h2>
            <Button variant="ghost" size="sm" className="text-primary" asChild>
              <Link href="/courses">
                {t("home.viewAll")}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>

          {recentReviews.length === 0 ? (
            <div className="bg-card rounded-xl p-8 border border-border/50 text-center">
              <p className="text-muted-foreground">Henüz değerlendirme yok</p>
              <Button asChild className="mt-4">
                <Link href="/courses">İlk değerlendirmeyi yaz</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-card rounded-xl p-5 border border-border/50 hover:shadow-md transition-all hover:border-primary/20"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{review.code}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${review.type === "course"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-emerald-100 text-emerald-700"
                            }`}
                        >
                          {review.type === "course" ? t("home.course") : t("home.professor")}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{review.name}</p>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 rounded-lg">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-medium text-amber-700">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    &quot;{review.comment}&quot;
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{review.author}</span>
                    <span>{review.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right - Sidebar */}
        <div className="space-y-6">
          {/* Popular Courses */}
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <div className="p-4 border-b border-border/50 bg-muted/30">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                {t("home.popularCourses")}
              </h3>
            </div>
            {topCourses.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Henüz değerlendirme yok
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {topCourses.map((course, i) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.code.replace(" ", "")}`}
                    className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors"
                  >
                    <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground text-sm">{course.code}</div>
                      <div className="text-xs text-muted-foreground truncate">{course.name}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {course.reviews} {t("common.reviews")}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Top Professors */}
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <div className="p-4 border-b border-border/50 bg-muted/30">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />
                {t("home.topProfessors")}
              </h3>
            </div>
            {topProfessors.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Henüz değerlendirme yok
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {topProfessors.map((prof) => (
                  <Link
                    key={prof.id}
                    href={`/professors/${prof.id}`}
                    className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center text-sm font-medium text-primary">
                      {prof.name.split(" ").pop()?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground text-sm truncate">
                        {prof.title} {prof.name}
                      </div>
                      <div className="text-xs text-muted-foreground">{prof.dept}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-medium">{prof.rating}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Write Review CTA */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl p-5 border border-border/50">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
              <PenLine className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">{t("home.shareExperience")}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t("home.shareDescription")}</p>
            <Button asChild className="w-full bg-primary hover:bg-primary/90 rounded-lg">
              <Link href="/courses">{t("home.writeReview")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
