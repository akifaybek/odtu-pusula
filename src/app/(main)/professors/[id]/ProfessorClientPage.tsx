"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  User,
  MessageSquare,
  Filter,
  PenLine,
  X,
  Star,
  BookOpen,
  ThumbsUp,
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
import ProfessorReviewCard from "@/components/professor/ProfessorReviewCard";
import TakeAgainBadge from "@/components/professor/TakeAgainBadge";
import ProfessorReviewForm, { ProfessorReviewData } from "@/components/review/ProfessorReviewForm";
import EmailVerificationAlert, { useCanWriteReview } from "@/components/review/EmailVerificationAlert";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/contexts/LanguageContext";

// Types
interface ProfessorData {
  id: string;
  name: string;
  title: string;
  titleEnum: string;
  email: string | null;
  image: string | null;
  department: {
    id: string;
    code: string;
    name: string;
    faculty: string;
  };
  courses: Array<{
    id: string;
    code: string;
    name: string;
    credits: number;
  }>;
}

interface Review {
  id: string;
  semester: string;
  teachingRating: number;
  gradingRating: number;
  accessRating: number;
  overallRating: number;
  wouldTakeAgain: boolean;
  comment: string;
  isAnonymous: boolean;
  likes: number;
  createdAt: string;
  user: { id: string; name: string } | null;
  course: { id: string; code: string; name: string } | null;
}

interface ProfessorDetailResponse {
  professor: ProfessorData;
  stats: {
    teaching: number;
    grading: number;
    accessibility: number;
    overall: number;
    wouldTakeAgainPercent: number;
    reviewCount: number;
  };
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

// Rating bar component
function RatingBar({ label, value, maxValue = 5 }: { label: string; value: number; maxValue?: number }) {
  const percentage = (value / maxValue) * 100;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value.toFixed(1)}</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function ProfessorDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const id = params.id as string;

  const [sortBy, setSortBy] = useState("newest");
  const [semester, setSemester] = useState("all");
  const [activeTab, setActiveTab] = useState<"overview" | "reviews">("overview");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showVerificationAlert, setShowVerificationAlert] = useState(false);

  // Email verification check
  const { canWrite, reason } = useCanWriteReview();

  // Data states
  const [professorData, setProfessorData] = useState<ProfessorDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch professor data
  const fetchProfessorData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams({
        sortBy,
      });

      const response = await fetch(`/api/professors/${id}?${queryParams}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Hoca bulunamadı");
        }
        throw new Error("Hoca bilgileri yüklenirken bir hata oluştu");
      }

      const data: ProfessorDetailResponse = await response.json();
      setProfessorData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }, [id, sortBy]);

  useEffect(() => {
    fetchProfessorData();
  }, [fetchProfessorData]);

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
  const handleReviewSubmit = async (data: ProfessorReviewData) => {
    try {
      const response = await fetch(`/api/professors/${id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: data.courseId,
          semester: data.semester,
          teachingRating: data.teaching,
          gradingRating: data.grading,
          accessRating: data.accessibility,
          overallRating: data.overall,
          wouldTakeAgain: data.wouldTakeAgain,
          comment: data.comment,
          isAnonymous: data.anonymous,
        }),
      });

      if (!response.ok) {
        throw await toApiClientErrorFromResponse(response, "Değerlendirme kaydedilemedi");
      }

      toast.success("Değerlendirmeniz başarıyla kaydedildi!");
      setShowReviewForm(false);
      fetchProfessorData();
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4 w-full">
              <Skeleton className="h-20 w-20 rounded-2xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-8 w-56" />
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-72" />
                <Skeleton className="h-6 w-36 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-10 w-full sm:w-44" />
          </div>
        </div>

        <Skeleton className="h-11 w-full sm:w-80 rounded-xl" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-72 rounded-xl lg:col-span-2" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !professorData) {
    return (
      <div className="space-y-6">
        <Link
          href="/professors"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Rehberlere Dön
        </Link>

        <EmptyState
          icon={X}
          title={error || "Hoca bulunamadı"}
          description="Bu hoca için bilgi bulunamadı veya bir hata oluştu."
          action={{
            label: "Tekrar Dene",
            onClick: fetchProfessorData,
          }}
          className="py-16"
        />
      </div>
    );
  }

  const { professor, stats, reviews } = professorData;

  // Filter reviews by semester
  const filteredReviews = reviews.data.filter((review) => {
    if (semester === "all") return true;
    return review.semester === semester;
  });

  return (
    <div className="space-y-6">
      {/* Geri Butonu */}
      <Link
        href="/professors"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Rehberlere Dön
      </Link>

      {/* Hoca Başlığı */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-primary">
                {professor.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </span>
            </div>

            <div className="space-y-2">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{professor.name}</h1>
                <p className="text-muted-foreground">{professor.title}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  {t(`departments.${professor.department.code}`).startsWith("departments.")
                    ? professor.department.name
                    : t(`departments.${professor.department.code}`)}
                </span>
                <span>•</span>
                <span>
                  {/* Try to translate with faculty code or name, fallback to raw name but never show 'faculties.' prefix */}
                  {t(`faculties.${professor.department.faculty}`).startsWith("faculties.")
                    ? professor.department.faculty
                    : t(`faculties.${professor.department.faculty}`)}
                </span>
              </div>
              <TakeAgainBadge percentage={stats.wouldTakeAgainPercent} />
            </div>
          </div>

          <Button
            onClick={handleWriteReviewClick}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
          >
            <PenLine className="h-4 w-4 mr-2" />
            Değerlendirme Yaz
          </Button>
        </div>
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
          <User className="h-4 w-4" />
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
        <div className="grid md:grid-cols-3 gap-6">
          {/* Sol Kolon - İstatistikler */}
          <div className="md:col-span-2 space-y-6">
            {/* Puan Kartı */}
            <div className="bg-card rounded-xl border p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="h-8 w-8 text-amber-500 fill-amber-500" />
                  <span className="text-4xl font-bold text-foreground">
                    {stats.overall.toFixed(1)}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <div>{stats.reviewCount} değerlendirme</div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    <span>%{stats.wouldTakeAgainPercent} tekrar alırdı</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <RatingBar label="Anlatım Kalitesi" value={stats.teaching} />
                <RatingBar label="Notlandırma Adaleti" value={stats.grading} />
                <RatingBar label="Ulaşılabilirlik" value={stats.accessibility} />
              </div>
            </div>

            {/* Verdiği Dersler */}
            <div className="bg-card rounded-xl border p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Verdiği Dersler
              </h3>
              {professor.courses.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-3">
                  {professor.courses.map((course) => (
                    <Link
                      key={course.id}
                      href={`/courses/${course.code}`}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div>
                        <div className="font-medium text-foreground">{course.code}</div>
                        <div className="text-sm text-muted-foreground">{course.name}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">{course.credits} KR</div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Bu hoca için ders bilgisi bulunmuyor.
                </p>
              )}
            </div>
          </div>

          {/* Sağ Kolon - Son Yorumlar */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Son Yorumlar</h3>
            {reviews.data.slice(0, 3).map((review) => (
              <div key={review.id} className="bg-card rounded-xl border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span className="font-medium">{review.overallRating}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{review.semester}</span>
                </div>
                <p className="text-sm text-foreground line-clamp-3">{review.comment}</p>
                {review.course && (
                  <div className="text-xs text-muted-foreground">
                    {review.course.code}
                  </div>
                )}
              </div>
            ))}
            {reviews.data.length > 3 && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setActiveTab("reviews")}
              >
                Tüm Yorumları Gör
              </Button>
            )}
          </div>
        </div>
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
                <ProfessorReviewCard
                  key={review.id}
                  id={review.id}
                  username={review.isAnonymous ? null : (review.user?.name || null)}
                  semester={review.semester}
                  courseName={review.course?.code || "Bilinmiyor"}
                  teaching={review.teachingRating}
                  grading={review.gradingRating}
                  accessibility={review.accessRating}
                  overall={review.overallRating}
                  wouldTakeAgain={review.wouldTakeAgain}
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
              description="Bu hoca için henüz yorum yapılmamış. İlk yorumu sen yap!"
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
        <ProfessorReviewForm
          professorId={professor.id}
          professorName={professor.name}
          courses={professor.courses.map((c) => ({ id: c.id, code: c.code, name: c.name }))}
          onClose={() => setShowReviewForm(false)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
}
