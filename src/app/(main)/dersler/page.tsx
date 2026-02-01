"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, Map, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CourseCard from "@/components/course/CourseCard";
import { cn } from "@/lib/utils";

// Bölümler
const departments = [
  { value: "all", label: "Tüm Bölümler" },
  { value: "CENG", label: "Bilgisayar Mühendisliği" },
  { value: "EE", label: "Elektrik-Elektronik Mühendisliği" },
  { value: "ME", label: "Makine Mühendisliği" },
  { value: "IE", label: "Endüstri Mühendisliği" },
  { value: "CE", label: "İnşaat Mühendisliği" },
  { value: "CHE", label: "Kimya Mühendisliği" },
  { value: "MATH", label: "Matematik" },
  { value: "PHYS", label: "Fizik" },
  { value: "CHEM", label: "Kimya" },
  { value: "STAT", label: "İstatistik" },
  { value: "BA", label: "İşletme" },
  { value: "ECON", label: "Ekonomi" },
  { value: "ARCH", label: "Mimarlık" },
  { value: "ID", label: "Endüstriyel Tasarım" },
  { value: "PSY", label: "Psikoloji" },
];

// Sıralama seçenekleri
const sortOptions = [
  { value: "popular", label: "En Popüler" },
  { value: "rating", label: "En Yüksek Puan" },
  { value: "difficulty-asc", label: "En Kolay" },
  { value: "difficulty-desc", label: "En Zor" },
  { value: "name", label: "İsme Göre (A-Z)" },
  { value: "code", label: "Koda Göre" },
];

interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  department: {
    id: string;
    code: string;
    name: string;
  };
  reviewCount: number;
  stats: {
    difficulty: number;
    workload: number;
    usefulness: number;
    overall: number;
  };
}

interface CoursesResponse {
  courses: Course[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function DerslerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [department, setDepartment] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCourses, setTotalCourses] = useState(0);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (department !== "all") {
        // Bölüm kodu ile departmentId'yi bulmak için
        params.set("departmentCode", department);
      }
      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      }
      params.set("sortBy", sortBy);

      const response = await fetch(`/api/courses?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Dersler yüklenirken bir hata oluştu");
      }

      const data: CoursesResponse = await response.json();
      setCourses(data.courses);
      setTotalCourses(data.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }, [department, debouncedSearch, sortBy]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Filter courses client-side for department (since API needs departmentId)
  const filteredCourses = courses.filter((course) => {
    if (department === "all") return true;
    return course.department.code === department;
  });

  const activeFiltersCount = [department !== "all"].filter(Boolean).length;

  const clearFilters = () => {
    setDepartment("all");
    setSearchQuery("");
  };

  return (
    <div className="space-y-6">
      {/* Sayfa Başlığı */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <Map className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ders Haritası</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? "Yükleniyor..." : `${totalCourses} ders arasından keşfet`}
          </p>
        </div>
      </div>

      {/* Arama ve Filtreler */}
      <div className="space-y-4">
        {/* Arama Çubuğu */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Ders kodu veya adı ara... (örn: CENG 242)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border/50 focus:border-primary/50"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Mobil filtre butonu */}
          <Button
            variant="outline"
            className={cn(
              "lg:hidden border-border/50",
              activeFiltersCount > 0 && "border-primary/50 text-primary"
            )}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filtre
            {activeFiltersCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-xs">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>

        {/* Filtreler - Desktop */}
        <div
          className={cn(
            "flex flex-wrap gap-3",
            "lg:flex",
            showFilters ? "flex" : "hidden"
          )}
        >
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-full sm:w-[200px] bg-card border-border/50">
              <SelectValue placeholder="Bölüm" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.value} value={dept.value}>
                  {dept.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[160px] bg-card border-border/50">
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

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Temizle
            </Button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Dersler yükleniyor...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
            <X className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Bir hata oluştu
          </h3>
          <p className="text-muted-foreground max-w-sm mb-4">{error}</p>
          <Button onClick={fetchCourses}>Tekrar Dene</Button>
        </div>
      )}

      {/* Sonuç Sayısı */}
      {!loading && !error && (
        <>
          <div className="text-sm text-muted-foreground">
            {filteredCourses.length} ders bulundu
            {(searchQuery || department !== "all") && (
              <span className="text-primary"> (filtrelenmiş)</span>
            )}
          </div>

          {/* Ders Kartları Grid */}
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  code={course.code}
                  name={course.name}
                  department={course.department.code}
                  credits={course.credits}
                  difficulty={course.stats.difficulty}
                  rating={course.stats.overall}
                  reviewCount={course.reviewCount}
                />
              ))}
            </div>
          ) : (
            /* Boş Durum */
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                <Map className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Ders bulunamadı
              </h3>
              <p className="text-muted-foreground max-w-sm mb-4">
                Arama kriterlerinize uygun ders bulunamadı. Filtreleri
                değiştirmeyi deneyin.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Filtreleri Temizle
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
