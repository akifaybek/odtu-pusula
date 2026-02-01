"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  MessageSquare,
  Filter,
  PenLine,
  BookOpen,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProfessorProfile from "@/components/professor/ProfessorProfile";
import ProfessorReviewCard from "@/components/professor/ProfessorReviewCard";
import { cn } from "@/lib/utils";

// Mock data
const mockProfessorData: Record<string, {
  professor: {
    id: string;
    name: string;
    title: string;
    department: string;
    email?: string;
  };
  stats: {
    overall: number;
    teaching: number;
    grading: number;
    accessibility: number;
    takeAgainPercent: number;
    reviewCount: number;
  };
  courses: Array<{
    code: string;
    name: string;
    rating: number;
  }>;
  reviews: Array<{
    id: string;
    username: string | null;
    semester: string;
    courseCode: string;
    courseName: string;
    teaching: number;
    grading: number;
    accessibility: number;
    overall: number;
    wouldTakeAgain: boolean;
    comment: string;
    createdAt: string;
    likes: number;
  }>;
}> = {
  "prof-1": {
    professor: {
      id: "prof-1",
      name: "Ahmet Yılmaz",
      title: "Prof. Dr.",
      department: "Bilgisayar Mühendisliği",
      email: "ayilmaz@metu.edu.tr",
    },
    stats: {
      overall: 4.5,
      teaching: 4.7,
      grading: 4.2,
      accessibility: 4.3,
      takeAgainPercent: 85,
      reviewCount: 156,
    },
    courses: [
      { code: "CENG 242", name: "Programming Language Concepts", rating: 4.2 },
      { code: "CENG 351", name: "Data Management and File Structures", rating: 4.0 },
      { code: "CENG 477", name: "Introduction to Computer Graphics", rating: 4.4 },
      { code: "CENG 495", name: "Advanced Topics in Computer Engineering", rating: 4.6 },
    ],
    reviews: [
      {
        id: "pr1",
        username: "ormanyolcusu",
        semester: "2024-25 Güz",
        courseCode: "CENG 242",
        courseName: "Programming Language Concepts",
        teaching: 4.8,
        grading: 4.0,
        accessibility: 4.5,
        overall: 4.5,
        wouldTakeAgain: true,
        comment: "Hoca gerçekten alanında uzman ve anlatımı çok akıcı. Derse hazırlıklı geliyor, örnekleri çok açıklayıcı. Sınavları adil ama zorlayıcı. Office hour'lara gitmenizi kesinlikle öneririm, her soruya sabırla cevap veriyor.",
        createdAt: "2024-12-15T10:30:00Z",
        likes: 32,
      },
      {
        id: "pr2",
        username: null,
        semester: "2024-25 Güz",
        courseCode: "CENG 351",
        courseName: "Data Management and File Structures",
        teaching: 4.5,
        grading: 4.2,
        accessibility: 4.0,
        overall: 4.3,
        wouldTakeAgain: true,
        comment: "Database konularını çok iyi öğreten bir hoca. Ödevler zaman alıcı ama öğretici. Projelerde gerçek dünya örnekleri kullanılıyor.",
        createdAt: "2024-12-10T15:45:00Z",
        likes: 18,
      },
      {
        id: "pr3",
        username: "kampuskedisi",
        semester: "2023-24 Bahar",
        courseCode: "CENG 242",
        courseName: "Programming Language Concepts",
        teaching: 4.9,
        grading: 4.5,
        accessibility: 4.8,
        overall: 4.7,
        wouldTakeAgain: true,
        comment: "Bu hocanın derslerini almak için bekleyin, değer. Fonksiyonel programlamayı sevdiren bir anlatımı var. Quiz'lere iyi çalışın ama genel olarak notlandırma adil.",
        createdAt: "2024-05-20T09:15:00Z",
        likes: 45,
      },
      {
        id: "pr4",
        username: "eymirbaligi",
        semester: "2023-24 Güz",
        courseCode: "CENG 477",
        courseName: "Introduction to Computer Graphics",
        teaching: 4.6,
        grading: 3.8,
        accessibility: 4.2,
        overall: 4.2,
        wouldTakeAgain: true,
        comment: "Graphics dersi zaten zor bir ders ama hoca elinden geleni yapıyor. Matematik ağırlıklı konularda biraz daha yavaşlasa iyi olur. Yine de tavsiye ederim.",
        createdAt: "2024-01-15T14:20:00Z",
        likes: 22,
      },
      {
        id: "pr5",
        username: "a4survivor",
        semester: "2022-23 Bahar",
        courseCode: "CENG 242",
        courseName: "Programming Language Concepts",
        teaching: 4.3,
        grading: 4.0,
        accessibility: 3.8,
        overall: 4.0,
        wouldTakeAgain: false,
        comment: "İyi bir hoca ama ben Prolog'a bir türlü ısınamadım. Haskell kısmı daha iyiydi. Sınavlar beklenenden zor çıkabiliyor, dikkat edin.",
        createdAt: "2023-05-10T11:00:00Z",
        likes: 8,
      },
    ],
  },
};

// Default data
const defaultProfessorData = {
  professor: {
    id: "unknown",
    name: "Bilinmeyen Hoca",
    title: "N/A",
    department: "N/A",
  },
  stats: {
    overall: 0,
    teaching: 0,
    grading: 0,
    accessibility: 0,
    takeAgainPercent: 0,
    reviewCount: 0,
  },
  courses: [],
  reviews: [],
};

// Sıralama seçenekleri
const sortOptions = [
  { value: "newest", label: "En Yeni" },
  { value: "oldest", label: "En Eski" },
  { value: "most-liked", label: "En Beğenilen" },
  { value: "highest-rating", label: "En Yüksek Puan" },
  { value: "lowest-rating", label: "En Düşük Puan" },
];

export default function ProfessorDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [sortBy, setSortBy] = useState("newest");
  const [courseFilter, setCourseFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"overview" | "reviews">("overview");

  // Get professor data or default
  const data = mockProfessorData[id] || defaultProfessorData;
  const { professor, stats, courses, reviews } = data;

  // Course filter options
  const courseOptions = [
    { value: "all", label: "Tüm Dersler" },
    ...courses.map((c) => ({ value: c.code, label: c.code })),
  ];

  // Filter and sort reviews
  const filteredReviews = reviews
    .filter((review) => {
      if (courseFilter === "all") return true;
      return review.courseCode === courseFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "most-liked":
          return b.likes - a.likes;
        case "highest-rating":
          return b.overall - a.overall;
        case "lowest-rating":
          return a.overall - b.overall;
        default:
          return 0;
      }
    });

  const handleLike = (reviewId: string) => {
    console.log("Liked review:", reviewId);
    // TODO: API call
  };

  return (
    <div className="space-y-6">
      {/* Geri Butonu */}
      <Link
        href="/hocalar"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Rehberlere Dön
      </Link>

      {/* Yorum Yaz Butonu - Sağ üst */}
      <div className="flex justify-end">
        <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
          <PenLine className="h-4 w-4 mr-2" />
          Değerlendirme Yaz
        </Button>
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
          <BarChart3 className="h-4 w-4" />
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
        <ProfessorProfile professor={professor} stats={stats} courses={courses} />
      ) : (
        <div className="space-y-6">
          {/* Filtreler */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>Filtrele:</span>
            </div>

            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-[160px] bg-card border-border/50">
                <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Ders" />
              </SelectTrigger>
              <SelectContent>
                {courseOptions.map((opt) => (
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
            {courseFilter !== "all" && <span className="text-primary"> ({courseFilter})</span>}
          </div>

          {/* Yorumlar */}
          {filteredReviews.length > 0 ? (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <ProfessorReviewCard key={review.id} {...review} onLike={handleLike} />
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
                Bu hoca için henüz yorum yapılmamış. İlk yorumu sen yap!
              </p>
              <Button className="bg-primary hover:bg-primary/90">
                <PenLine className="h-4 w-4 mr-2" />
                Yorum Yaz
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
