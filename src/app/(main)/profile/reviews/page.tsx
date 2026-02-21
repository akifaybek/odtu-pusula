"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  BookOpen,
  Users,
  Loader2,
  Star,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserReviewsListWithEdit } from "@/components/profile/UserReviewsListWithEdit";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/LanguageContext";

interface CourseReview {
  id: string;
  type: "course";
  semester: string;
  difficultyRating: number;
  workloadRating: number;
  usefulnessRating: number;
  overallRating: number;
  grade: string | null;
  comment: string;
  isAnonymous: boolean;
  likes: number;
  createdAt: string;
  course: { id: string; code: string; name: string };
  professor: { id: string; name: string; title: string } | null;
}

interface ProfessorReview {
  id: string;
  type: "professor";
  semester: string;
  teachingRating: number;
  gradingRating: number;
  accessRating: number;
  overallRating: number;
  comment: string;
  isAnonymous: boolean;
  wouldTakeAgain: boolean;
  likes: number;
  createdAt: string;
  professor: { id: string; name: string; title: string };
  course: { id: string; code: string; name: string } | null;
}

export default function MyReviewsPage() {
  const { status } = useSession();
  const router = useRouter();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"courses" | "professors">("courses");
  const [courseReviews, setCourseReviews] = useState<CourseReview[]>([]);
  const [professorReviews, setProfessorReviews] = useState<ProfessorReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/user/reviews");

      if (!response.ok) {
        throw new Error(t("errors.loadingReviews"));
      }

      const data = await response.json();
      setCourseReviews(data.courseReviews || []);
      setProfessorReviews(data.professorReviews || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchReviews();
    }
  }, [status, router, fetchReviews]);

  const handleDeleteReview = async (id: string, type: "course" | "professor") => {
    const res = await fetch(`/api/reviews/${id}?type=${type}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error(t("errors.deleteReview"));
    }

    if (type === "course") {
      setCourseReviews((prev) => prev.filter((r) => r.id !== id));
    } else {
      setProfessorReviews((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleUpdateReview = async (
    id: string,
    type: "course" | "professor",
    data: Record<string, unknown>
  ) => {
    const res = await fetch(`/api/reviews/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, ...data }),
    });

    if (!res.ok) {
      throw new Error(t("errors.updateReview"));
    }

    const updated = await res.json();

    if (type === "course") {
      setCourseReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updated, type: "course" } : r))
      );
    } else {
      setProfessorReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...updated, type: "professor" } : r))
      );
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-destructive">{error}</p>
        <button
          onClick={fetchReviews}
          className="text-primary hover:underline"
        >
          {t("common.tryAgain")}
        </button>
      </div>
    );
  }

  const currentReviews =
    activeTab === "courses" ? courseReviews : professorReviews;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/profile"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground">
              {t("profile.myReviews")}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {t("profile.allReviews")}
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          <span>{courseReviews.length + professorReviews.length} {t("common.reviews")}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("courses")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
            activeTab === "courses"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <BookOpen className="h-4 w-4" />
          {t("profile.courseReviews")}
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-xs",
              activeTab === "courses"
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            {courseReviews.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("professors")}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all",
            activeTab === "professors"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Users className="h-4 w-4" />
          {t("profile.professorReviews")}
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-xs",
              activeTab === "professors"
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            {professorReviews.length}
          </span>
        </button>
      </div>

      {/* Reviews */}
      <div className="bg-card rounded-xl border p-6">
        {currentReviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              {activeTab === "courses" ? (
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              ) : (
                <Users className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {t("profile.noReviews")}
            </h3>
            <p className="text-muted-foreground mb-4">
              {activeTab === "courses"
                ? t("profile.noReviewsDescription")
                : t("profile.noProfessorReviewsDescription")}
            </p>
            <Button asChild>
              <Link href={activeTab === "courses" ? "/courses" : "/professors"}>
                <Star className="h-4 w-4 mr-2" />
                {activeTab === "courses" ? t("common.courses") : t("common.professors")}
              </Link>
            </Button>
          </div>
        ) : (
          <UserReviewsListWithEdit
            reviews={currentReviews}
            onDelete={handleDeleteReview}
            onUpdate={handleUpdateReview}
          />
        )}
      </div>
    </div>
  );
}
