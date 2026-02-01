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
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import CourseDetail from "@/components/course/CourseDetail";
import ReviewCard from "@/components/course/ReviewCard";
import DifficultyBadge, { getDifficultyFromScore } from "@/components/shared/DifficultyBadge";
import CourseReviewForm, { CourseReviewData } from "@/components/review/CourseReviewForm";
import { cn } from "@/lib/utils";

// Types
interface CourseData {
  id: string;
  code: string;
  name: string;
  credits: number;
  description: string | null;
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
  };
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
  const code = (params.code as string)?.replace(/-/g, " ").toUpperCase();

  const [sortBy, setSortBy] = useState("newest");
  const [semester, setSemester] = useState("all");
  const [activeTab, setActiveTab] = useState<"overview" | "reviews">("overview");
  const [showReviewForm, setShowReviewForm] = useState(false);

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

  // Handle review submission
  const handleReviewSubmit = async (data: CourseReviewData) => {
    const urlCode = (params.code as string)?.toUpperCase();

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
        grade: data.grade || null,
        comment: data.comment,
        isAnonymous: data.anonymous,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Değerlendirme kaydedilemedi");
    }

    toast.success("Değerlendirmeniz başarıyla kaydedildi!");
    setShowReviewForm(false);
    fetchCourseData(); // Refresh data
  };

  const handleLike = async (reviewId: string) => {
    // TODO: Implement like API
    console.log("Liked review:", reviewId);
    toast.info("Beğeni sistemi yakında aktif olacak!");
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Ders bilgileri yükleniyor...</p>
      </div>
    );
  }

  // Error state
  if (error || !courseData) {
    return (
      <div className="space-y-6">
        <Link
          href="/dersler"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Ders Haritasına Dön
        </Link>

        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
            <X className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            {error || "Ders bulunamadı"}
          </h3>
          <p className="text-muted-foreground max-w-sm mb-4">
            Bu ders için bilgi bulunamadı veya bir hata oluştu.
          </p>
          <Button onClick={fetchCourseData}>Tekrar Dene</Button>
        </div>
      </div>
    );
  }

  const { course, stats, professors, reviews } = courseData;

  // Filter reviews by semester (client-side)
  const filteredReviews = reviews.data.filter((review) => {
    if (semester === "all") return true;
    return review.semester === semester;
  });

  return (
    <div className="space-y-6">
      {/* Geri Butonu */}
      <Link
        href="/dersler"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Ders Haritasına Dön
      </Link>

      {/* Ders Başlığı */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">{course.code}</h1>
              <div className="px-2.5 py-1 rounded-full bg-muted text-xs font-semibold text-foreground">
                {course.credits} KR
              </div>
            </div>
            <p className="text-lg text-muted-foreground">{course.name}</p>
            <DifficultyBadge level={getDifficultyFromScore(stats.difficulty)} score={stats.difficulty} />
          </div>

          <Button
            onClick={() => setShowReviewForm(true)}
            className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
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
      <div className="flex gap-1 p-1 bg-muted/50 rounded-xl w-fit">
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
              <SelectTrigger className="w-[160px] bg-card border-border/50">
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
              <SelectTrigger className="w-[160px] bg-card border-border/50">
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
                  username={review.user?.name || null}
                  semester={review.semester}
                  professorName={review.professor?.name || "Bilinmiyor"}
                  difficulty={review.difficultyRating}
                  workload={review.workloadRating}
                  usefulness={review.usefulnessRating}
                  overall={review.overallRating}
                  grade={review.grade || undefined}
                  comment={review.comment}
                  createdAt={review.createdAt}
                  likes={review.likes}
                  onLike={handleLike}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Henüz yorum yok
              </h3>
              <p className="text-muted-foreground max-w-sm mb-4">
                Bu ders için henüz yorum yapılmamış. İlk yorumu sen yap!
              </p>
              <Button
                onClick={() => setShowReviewForm(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <PenLine className="h-4 w-4 mr-2" />
                Yorum Yaz
              </Button>
            </div>
          )}
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
