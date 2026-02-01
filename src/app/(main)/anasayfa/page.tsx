"use client";

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
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock veriler
const recentReviews = [
  {
    id: 1,
    type: "course",
    code: "CENG 242",
    name: "Programming Language Concepts",
    rating: 4.5,
    comment: "Zorlu ama çok öğretici bir ders...",
    author: "Anonim",
    time: "2 saat önce",
  },
  {
    id: 2,
    type: "professor",
    code: "Prof. Dr. Yılmaz",
    name: "Bilgisayar Mühendisliği",
    rating: 4.7,
    comment: "Harika bir hoca, anlatımı çok iyi...",
    author: "kampuskedisi",
    time: "5 saat önce",
  },
  {
    id: 3,
    type: "course",
    code: "MATH 119",
    name: "Calculus with Analytic Geometry",
    rating: 3.8,
    comment: "Klasik matematik dersi, bol çalışma gerektirir...",
    author: "Anonim",
    time: "1 gün önce",
  },
];

const popularCourses = [
  { code: "CENG 111", name: "C Programming", rating: 4.3, reviews: 245 },
  { code: "MATH 119", name: "Calculus I", rating: 3.5, reviews: 342 },
  { code: "PHYS 105", name: "General Physics I", rating: 3.8, reviews: 289 },
  { code: "EE 230", name: "Probability", rating: 4.1, reviews: 198 },
];

const topProfessors = [
  { name: "Prof. Dr. Ahmet Yılmaz", dept: "CENG", rating: 4.7, reviews: 156 },
  { name: "Doç. Dr. Elif Demir", dept: "CENG", rating: 4.5, reviews: 98 },
  { name: "Prof. Dr. Fatma Güneş", dept: "PSY", rating: 4.8, reviews: 67 },
];

export default function AnasayfaPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-10">
      {/* Hoş Geldin Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#a41034] to-[#7a0c28] p-8 md:p-12 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <Compass className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Hoş Geldin{session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}!
              </h1>
              <p className="text-white/70 text-sm">ODTÜ Pusula</p>
            </div>
          </div>

          <p className="text-white/80 max-w-2xl mb-6 leading-relaxed">
            ODTÜ Pusula platformuna hoş geldiniz. Buradan dersleri ve hocaları değerlendirmelerinizi görebilir ve yeni değerlendirmeler ekleyebilirsiniz.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-white text-[#a41034] hover:bg-white/90 rounded-full">
              <Link href="/dersler">
                <BookOpen className="h-4 w-4 mr-2" />
                Dersleri Keşfet
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-full">
              <Link href="/hocalar">
                <Users className="h-4 w-4 mr-2" />
                Hocaları İncele
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Hızlı İstatistikler */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-2xl p-5 border border-border/50 hover:shadow-lg transition-shadow">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">500+</div>
          <div className="text-sm text-muted-foreground">Ders</div>
        </div>
        <div className="bg-card rounded-2xl p-5 border border-border/50 hover:shadow-lg transition-shadow">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-3">
            <Users className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-foreground">200+</div>
          <div className="text-sm text-muted-foreground">Hoca</div>
        </div>
        <div className="bg-card rounded-2xl p-5 border border-border/50 hover:shadow-lg transition-shadow">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-3">
            <Star className="h-5 w-5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-foreground">3K+</div>
          <div className="text-sm text-muted-foreground">Değerlendirme</div>
        </div>
        <div className="bg-card rounded-2xl p-5 border border-border/50 hover:shadow-lg transition-shadow">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-foreground">1K+</div>
          <div className="text-sm text-muted-foreground">Aktif Kullanıcı</div>
        </div>
      </div>

      {/* Ana İçerik Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sol - Son Değerlendirmeler */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Son Değerlendirmeler
            </h2>
            <Button variant="ghost" size="sm" className="text-primary" asChild>
              <Link href="/dersler">
                Tümünü Gör
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>

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
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        review.type === "course"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {review.type === "course" ? "Ders" : "Hoca"}
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
        </div>

        {/* Sağ - Sidebar */}
        <div className="space-y-6">
          {/* Popüler Dersler */}
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <div className="p-4 border-b border-border/50 bg-muted/30">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                Popüler Dersler
              </h3>
            </div>
            <div className="divide-y divide-border/50">
              {popularCourses.map((course, i) => (
                <Link
                  key={course.code}
                  href={`/dersler/${course.code.replace(" ", "")}`}
                  className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors"
                >
                  <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground text-sm">{course.code}</div>
                    <div className="text-xs text-muted-foreground truncate">{course.name}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{course.reviews} yorum</div>
                </Link>
              ))}
            </div>
          </div>

          {/* En İyi Hocalar */}
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <div className="p-4 border-b border-border/50 bg-muted/30">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />
                En Yüksek Puanlı Hocalar
              </h3>
            </div>
            <div className="divide-y divide-border/50">
              {topProfessors.map((prof) => (
                <Link
                  key={prof.name}
                  href="/hocalar"
                  className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center text-sm font-medium text-primary">
                    {prof.name.split(" ").pop()?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground text-sm truncate">{prof.name}</div>
                    <div className="text-xs text-muted-foreground">{prof.dept}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-sm font-medium">{prof.rating}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Değerlendirme Yaz CTA */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-border/50">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
              <PenLine className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Deneyimini Paylaş</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Aldığın dersler ve hocalar hakkında değerlendirme yaz, diğer öğrencilere yardımcı ol.
            </p>
            <Button asChild className="w-full bg-primary hover:bg-primary/90 rounded-lg">
              <Link href="/dersler">
                Değerlendirme Yaz
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
