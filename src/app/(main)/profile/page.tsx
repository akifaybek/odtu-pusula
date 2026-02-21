"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  ProfileHeader,
  ProfileStats,
  ProfileTabs,
  UserReviewsList,
} from "@/components/profile";
import { Loader2, Heart, BookOpen, Users } from "lucide-react";
import Link from "next/link";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  year: string | null;
  image: string | null;
  createdAt: string;
  department: {
    id: string;
    code: string;
    name: string;
    faculty: string;
  } | null;
  stats: {
    totalReviews: number;
    courseReviews: number;
    professorReviews: number;
    totalLikes: number;
  };
}

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

interface LikedReview {
  id: string;
  type: "course" | "professor";
  comment: string;
  overallRating: number;
  likedAt: string;
  course?: { id: string; code: string; name: string };
  professor?: { id: string; name: string; title: string };
}

export default function ProfilPage() {
  const { status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [courseReviews, setCourseReviews] = useState<CourseReview[]>([]);
  const [professorReviews, setProfessorReviews] = useState<ProfessorReview[]>([]);
  const [likedReviews, setLikedReviews] = useState<LikedReview[]>([]);
  const [activeTab, setActiveTab] = useState<"course" | "professor" | "likes">("course");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchData();
    }
  }, [status, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [profileRes, reviewsRes, likesRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/user/reviews"),
        fetch("/api/user/likes"),
      ]);

      if (!profileRes.ok) {
        throw new Error("Profil yüklenemedi");
      }

      const profileData = await profileRes.json();
      setProfile(profileData);

      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setCourseReviews(reviewsData.courseReviews || []);
        setProfessorReviews(reviewsData.professorReviews || []);
      }

      if (likesRes.ok) {
        const likesData = await likesRes.json();
        const allLiked: LikedReview[] = [
          ...(likesData.likedCourseReviews || []),
          ...(likesData.likedProfessorReviews || []),
        ].sort((a, b) => new Date(b.likedAt).getTime() - new Date(a.likedAt).getTime());
        setLikedReviews(allLiked);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (id: string, type: "course" | "professor") => {
    const res = await fetch(`/api/reviews/${id}?type=${type}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Değerlendirme silinemedi");
    }

    if (type === "course") {
      setCourseReviews((prev) => prev.filter((r) => r.id !== id));
      if (profile) {
        setProfile({
          ...profile,
          stats: {
            ...profile.stats,
            courseReviews: profile.stats.courseReviews - 1,
            totalReviews: profile.stats.totalReviews - 1,
          },
        });
      }
    } else {
      setProfessorReviews((prev) => prev.filter((r) => r.id !== id));
      if (profile) {
        setProfile({
          ...profile,
          stats: {
            ...profile.stats,
            professorReviews: profile.stats.professorReviews - 1,
            totalReviews: profile.stats.totalReviews - 1,
          },
        });
      }
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
          onClick={fetchData}
          className="text-primary hover:underline"
        >
          Tekrar dene
        </button>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const currentReviews =
    activeTab === "course" ? courseReviews : professorReviews;

  return (
    <div className="space-y-6">
      {/* Header */}
      <ProfileHeader user={profile} />

      {/* Stats */}
      <ProfileStats stats={profile.stats} />

      {/* Reviews Section */}
      <div className="bg-card rounded-xl border">
        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          courseCount={courseReviews.length}
          professorCount={professorReviews.length}
          likesCount={likedReviews.length}
        />

        <div className="p-6">
          {activeTab === "likes" ? (
            <LikedReviewsList reviews={likedReviews} />
          ) : (
            <UserReviewsList
              reviews={currentReviews}
              onDelete={handleDeleteReview}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function LikedReviewsList({ reviews }: { reviews: LikedReview[] }) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground">Henüz beğendiğiniz bir değerlendirme yok.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Değerlendirmeleri beğenerek buraya ekleyebilirsiniz.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {review.type === "course" ? (
                  <BookOpen className="h-4 w-4 text-blue-500" />
                ) : (
                  <Users className="h-4 w-4 text-green-500" />
                )}
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {review.type === "course" ? "Ders" : "Hoca"}
                </span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-xs ${
                        i < review.overallRating ? "text-yellow-500" : "text-muted-foreground/30"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              {review.type === "course" && review.course && (
                <Link
                  href={`/courses/${review.course.code}`}
                  className="font-medium hover:text-primary transition-colors"
                >
                  {review.course.code} - {review.course.name}
                </Link>
              )}

              {review.type === "professor" && review.professor && (
                <Link
                  href={`/professors/${review.professor.id}`}
                  className="font-medium hover:text-primary transition-colors"
                >
                  {review.professor.title} {review.professor.name}
                </Link>
              )}

              {review.comment && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  &quot;{review.comment}&quot;
                </p>
              )}
            </div>

            <div className="flex items-center gap-1 text-muted-foreground">
              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            </div>
          </div>

          <div className="mt-2 text-xs text-muted-foreground">
            {new Date(review.likedAt).toLocaleDateString("tr-TR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            tarihinde beğenildi
          </div>
        </div>
      ))}
    </div>
  );
}
