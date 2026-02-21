"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  BookOpen,
  MessageSquare,
  Filter,
  PenLine,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { toApiClientError, toApiClientErrorFromResponse } from "@/lib/http-error";
import CourseDetail from "@/components/course/CourseDetail";
import ReviewCard from "@/components/course/ReviewCard";
import DifficultyBadge, { getDifficultyFromScore } from "@/components/shared/DifficultyBadge";
import CourseTypeBadge from "@/components/shared/CourseTypeBadge";
import CourseReviewForm, { CourseReviewData } from "@/components/review/CourseReviewForm";
import EmailVerificationAlert, { useCanWriteReview } from "@/components/review/EmailVerificationAlert";
import { cn } from "@/lib/utils";

// Types
type CourseType = "REQUIRED" | "ELECTIVE" | "TECH_ELECTIVE" | "NON_TECH" | "FREE_ELECTIVE";

interface CourseData {
  id: string;
  code: string;
  name: string;
  credits: number;
  description: string | null;
  courseType?: CourseType | null;
  department: {
    id: string;
    code: string;
    name: string;
    faculty: string;
  };
}

interface Professor {
  id: string;
  name: string;
  title: string;
  rating: number;
  reviewCount: number;
}

interface Review {
  id: string;
  semester: string;
  difficultyRating: number;
  workloadRating: number;
  usefulnessRating: number;
  overallRating: number;
  wouldRecommend?: boolean | null;
  grade: string | null;
  comment: string;
  isAnonymous: boolean;
  likes: number;
  createdAt: string;
  user: { id: string; name: string } | null;
  professor: { id: string; name: string; title: string } | null;
}

interface CourseDetailResponse {
  course: CourseData;
  stats: {
    difficulty: number;
    workload: number;
    usefulness: number;
    overall: number;
    reviewCount: number;
    recommendPercent?: number;
  };
  gradeDistribution?: Record<string, number>;
  professors: Professor[];
  reviews: {
    data: Review[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Sıralama seçenekleri
const sortOptions = [
  { value: "newest", label: "En Yeni" },
  { value: "oldest", label: "En Eski" },
  { value: "most-liked", label: "En Beğenilen" },
  { value: "highest-rating", label: "En Yüksek Puan" },
  { value: "lowest-rating", label: "En Düşük Puan" },
];

// Filtre seçenekleri
const semesterOptions = [
  { value: "all", label: "Tüm Dönemler" },
  { value: "2024-2025 Guz", label: "2024-25 Güz" },
  { value: "2024-2025 Bahar", label: "2024-25 Bahar" },
  { value: "2023-2024 Guz", label: "2023-24 Güz" },
  { value: "2023-2024 Bahar", label: "2023-24 Bahar" },
];

export default function CourseDetailPage() {
  const params = useParams();
  const [sortBy, setSortBy] = useState("newest");
  const [semester, setSemester] = useState("all");
  const [activeTab, setActiveTab] = useState<"overview" | "reviews">("overview");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);

  // Email verification check
  const { canWrite, reason } = useCanWriteReview();

  // Data states
  const [courseData, setCourseData] = useState<CourseDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch course data
  const fetchCourseData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const urlCode = (params.code as string)?.toUpperCase();
      const queryParams = new URLSearchParams({
        sortBy,
      });

      const response = await fetch(`/api/courses/${urlCode}?${queryParams}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Ders bulunamadı");
        }
        throw new Error("Ders bilgileri yüklenirken bir hata oluştu");
      }

      const data: CourseDetailResponse = await response.json();
      setCourseData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }, [params.code, sortBy]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  // Handle write review button click
  const handleWriteReviewClick = () => {
    if (!canWrite) {
      if (reason === "not_authenticated") {
        toast.error("Değerlendirme yazmak için giriş yapmalısınız");
        return;
      }
      if (reason === "not_verified") {
        setShowVerificationAlert(true);
        return;
      }
    }
    setShowReviewForm(true);
  };

  // Handle review submission
  const handleReviewSubmit = async (data: CourseReviewData) => {
    const urlCode = (params.code as string)?.toUpperCase();

    try {
      const response = await fetch(`/api/courses/${urlCode}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          professorId: data.professorId,
          semester: data.semester,
          difficultyRating: data.difficulty,
          workloadRating: data.workload,
          usefulnessRating: data.usefulness,
          overallRating: data.overall,
          wouldRecommend: data.wouldRecommend,
          grade: data.grade || null,
          comment: data.comment,
          isAnonymous: data.anonymous,
        }),
      });

      if (!response.ok) {
        throw await toApiClientErrorFromResponse(response, "Değerlendirme kaydedilemedi");
      }

      toast.success("Değerlendirmeniz başarıyla kaydedildi!");
      setShowReviewForm(false);
      fetchCourseData(); // Refresh data
    } catch (error) {
      throw toApiClientError(error, "Değerlendirme kaydedilemedi");
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-40" />

        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2 w-full">
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-40" />
                <Skeleton className="h-6 w-14 rounded-full" />
              </div>
              <Skeleton className="h-5 w-64" />
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>
            <Skeleton className="h-10 w-full sm:w-44" />
          </div>
          <Skeleton className="h-16 w-full max-w-3xl" />
        </div>

        <Skeleton className="h-11 w-full sm:w-80 rounded-xl" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 rounded-xl lg:col-span-2" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !courseData) {
    return (
      <div className="space-y-6">
        <Link
          href="/courses"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Ders Haritasına Dön
        </Link>

        <EmptyState
          icon={X}
          title={error || "Ders bulunamadı"}
          description="Bu ders için bilgi bulunamadı veya bir hata oluştu."
          action={{
            label: "Tekrar Dene",
            onClick: fetchCourseData,
          }}
          className="py-16"
        />
      </div>
    );
  }

  const { course, stats, gradeDistribution, professors, reviews } = courseData;

  // Filter reviews by semester (client-side)
  const filteredReviews = reviews.data.filter((review) => {
    if (semester === "all") return true;
    return review.semester === semester;
  });

  return (
    <div className="space-y-6">
      {/* Geri Butonu */}
      <Link
        href="/courses"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Ders Haritasına Dön
      </Link>

      {/* Ders Başlığı */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold text-foreground">{course.code}</h1>
              <div className="px-2.5 py-1 rounded-full bg-muted text-xs font-semibold text-foreground">
                {course.credits} KR
              </div>
              {course.courseType && <CourseTypeBadge type={course.courseType} size="sm" />}
            </div>
            <p className="text-lg text-muted-foreground">{course.name}</p>
            <DifficultyBadge level={getDifficultyFromScore(stats.difficulty)} score={stats.difficulty} />
          </div>

          <Button
            onClick={handleWriteReviewClick}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
          >
            <PenLine className="h-4 w-4 mr-2" />
            Değerlendirme Yaz
          </Button>
        </div>

        {course.description && (
          <p className="text-foreground/80 leading-relaxed max-w-3xl">
            {course.description}
          </p>
        )}
      </div>

      {/* Tab Navigasyonu */}
      <div className="flex w-full sm:w-fit gap-1 p-1 bg-muted/50 rounded-xl overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === "overview"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <BookOpen className="h-4 w-4" />
          Genel Bakış
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
            activeTab === "reviews"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <MessageSquare className="h-4 w-4" />
          Yorumlar
          <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
            {stats.reviewCount}
          </span>
        </button>
      </div>

      {/* Tab İçeriği */}
      {activeTab === "overview" ? (
        <CourseDetail
          course={course}
          stats={stats}
          gradeDistribution={gradeDistribution}
          professors={professors}
        />
      ) : (
        <div className="space-y-6">
          {/* Filtreler */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>Filtrele:</span>
            </div>

            <Select value={semester} onValueChange={setSemester}>
              <SelectTrigger className="w-full sm:w-[180px] bg-card border-border/50">
                <SelectValue placeholder="Dönem" />
              </SelectTrigger>
              <SelectContent>
                {semesterOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px] bg-card border-border/50">
                <SelectValue placeholder="Sırala" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Yorum Sayısı */}
          <div className="text-sm text-muted-foreground">
            {filteredReviews.length} yorum
            {semester !== "all" && <span className="text-primary"> (filtrelenmiş)</span>}
          </div>

          {/* Yorumlar */}
          {filteredReviews.length > 0 ? (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  id={review.id}
                  username={review.isAnonymous ? null : (review.user?.name || null)}
                  semester={review.semester}
                  professorName={review.professor?.name || "Bilinmiyor"}
                  difficulty={review.difficultyRating}
                  workload={review.workloadRating}
                  usefulness={review.usefulnessRating}
                  overall={review.overallRating}
                  wouldRecommend={review.wouldRecommend}
                  grade={review.grade || undefined}
                  comment={review.comment}
                  createdAt={review.createdAt}
                  likes={review.likes}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={MessageSquare}
              title="Henüz yorum yok"
              description="Bu ders için henüz yorum yapılmamış. İlk yorumu sen yap!"
              action={{
                label: "Yorum Yaz",
                onClick: handleWriteReviewClick,
              }}
              className="py-16"
            />
          )}
        </div>
      )}

      {/* Review Form Modal */}
      {/* Email Verification Alert Modal */}
      {showVerificationAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md p-6">
            <EmailVerificationAlert
              onClose={() => setShowVerificationAlert(false)}
            />
          </div>
        </div>
      )}

      {/* Review Form Modal */}
      {showReviewForm && (
        <CourseReviewForm
          courseCode={course.code}
          courseName={course.name}
          professors={professors.map((p) => ({ id: p.id, name: p.name }))}
          onClose={() => setShowReviewForm(false)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
}
