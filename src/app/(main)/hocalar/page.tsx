"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Users, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProfessorCard from "@/components/professor/ProfessorCard";
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

// Ünvan seçenekleri
const titleOptions = [
  { value: "all", label: "Tüm Ünvanlar" },
  { value: "Prof. Dr.", label: "Prof. Dr." },
  { value: "Doç. Dr.", label: "Doç. Dr." },
  { value: "Dr. Öğr. Üyesi", label: "Dr. Öğr. Üyesi" },
  { value: "Öğr. Gör.", label: "Öğr. Gör." },
  { value: "Arş. Gör.", label: "Arş. Gör." },
];

// Sıralama seçenekleri
const sortOptions = [
  { value: "popular", label: "En Çok Yorumlanan" },
  { value: "rating", label: "En Yüksek Puan" },
  { value: "name", label: "Alfabetik (A-Z)" },
  { value: "take-again", label: "Tekrar Alırım Oranı" },
];

interface Professor {
  id: string;
  name: string;
  title: string;
  titleEnum: string;
  department: {
    id: string;
    code: string;
    name: string;
  };
  courses: Array<{
    id: string;
    code: string;
    name: string;
  }>;
  reviewCount: number;
  stats: {
    teaching: number;
    grading: number;
    accessibility: number;
    overall: number;
    wouldTakeAgainPercent: number;
  };
}

interface ProfessorsResponse {
  professors: Professor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function HocalarPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [department, setDepartment] = useState("all");
  const [title, setTitle] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);

  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProfessors, setTotalProfessors] = useState(0);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Ünvan chip'leri
  const titleChips = ["Prof. Dr.", "Doç. Dr.", "Dr. Öğr. Üyesi", "Arş. Gör."];

  // Fetch professors
  const fetchProfessors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (department !== "all") {
        params.set("departmentCode", department);
      }
      if (title !== "all") {
        params.set("title", title);
      }
      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      }
      params.set("sortBy", sortBy);

      const response = await fetch(`/api/professors?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Hocalar yüklenirken bir hata oluştu");
      }

      const data: ProfessorsResponse = await response.json();
      setProfessors(data.professors);
      setTotalProfessors(data.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }, [department, title, debouncedSearch, sortBy]);

  useEffect(() => {
    fetchProfessors();
  }, [fetchProfessors]);

  const activeFiltersCount = [
    department !== "all",
    title !== "all",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setDepartment("all");
    setTitle("all");
    setSearchQuery("");
  };

  return (
    <div className="space-y-6">
      {/* Sayfa Başlığı */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Rehberler</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? "Yükleniyor..." : `${totalProfessors} hoca arasından keşfet`}
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
              placeholder="Hoca ara..."
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
            Filtre
            {activeFiltersCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-xs">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>

        {/* Ünvan Chip'leri */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTitle("all")}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
              title === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
            )}
          >
            Tümü
          </button>
          {titleChips.map((t) => (
            <button
              key={t}
              onClick={() => setTitle(title === t ? "all" : t)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                title === t
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Diğer Filtreler */}
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
          <p className="text-muted-foreground">Hocalar yükleniyor...</p>
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
          <Button onClick={fetchProfessors}>Tekrar Dene</Button>
        </div>
      )}

      {/* Sonuç Sayısı */}
      {!loading && !error && (
        <>
          <div className="text-sm text-muted-foreground">
            {professors.length} rehber bulundu
            {(searchQuery || department !== "all" || title !== "all") && (
              <span className="text-primary"> (filtrelenmiş)</span>
            )}
          </div>

          {/* Hoca Kartları Grid */}
          {professors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {professors.map((professor) => (
                <ProfessorCard
                  key={professor.id}
                  id={professor.id}
                  name={professor.name}
                  title={professor.title}
                  department={professor.department.code}
                  rating={professor.stats.overall}
                  takeAgainPercent={professor.stats.wouldTakeAgainPercent}
                  reviewCount={professor.reviewCount}
                  courses={professor.courses.map((c) => c.code)}
                />
              ))}
            </div>
          ) : (
            /* Boş Durum */
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Rehber bulunamadı
              </h3>
              <p className="text-muted-foreground max-w-sm mb-4">
                Arama kriterlerinize uygun hoca bulunamadı. Filtreleri
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
