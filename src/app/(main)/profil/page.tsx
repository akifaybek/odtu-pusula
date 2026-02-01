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
import { Loader2 } from "lucide-react";

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

export default function ProfilPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [courseReviews, setCourseReviews] = useState<CourseReview[]>([]);
  const [professorReviews, setProfessorReviews] = useState<ProfessorReview[]>([]);
  const [activeTab, setActiveTab] = useState<"course" | "professor">("course");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/giris");
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

      const [profileRes, reviewsRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/user/reviews"),
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
        />

        <div className="p-6">
          <UserReviewsList
            reviews={currentReviews}
            onDelete={handleDeleteReview}
          />
        </div>
      </div>
    </div>
  );
}
