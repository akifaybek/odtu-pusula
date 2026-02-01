"use client";

import { useState, useMemo } from "react";
import { Search, Users, X } from "lucide-react";
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

// Ünvanlar
const titles = [
  { value: "all", label: "Tüm Ünvanlar" },
  { value: "Prof. Dr.", label: "Prof. Dr." },
  { value: "Doç. Dr.", label: "Doç. Dr." },
  { value: "Dr. Öğr. Üyesi", label: "Dr. Öğr. Üyesi" },
  { value: "Araş. Gör.", label: "Araş. Gör." },
];

// Sıralama seçenekleri
const sortOptions = [
  { value: "popular", label: "En Çok Yorumlanan" },
  { value: "rating", label: "En Yüksek Puan" },
  { value: "name", label: "Alfabetik (A-Z)" },
  { value: "take-again", label: "Tekrar Alırım Oranı" },
];

// Mock data
const mockProfessors = [
  {
    id: "prof-1",
    name: "Ahmet Yılmaz",
    title: "Prof. Dr.",
    department: "CENG",
    rating: 4.5,
    takeAgainPercent: 85,
    reviewCount: 156,
    courses: ["CENG 242", "CENG 351", "CENG 477", "CENG 495"],
  },
  {
    id: "prof-2",
    name: "Elif Demir",
    title: "Doç. Dr.",
    department: "CENG",
    rating: 4.2,
    takeAgainPercent: 72,
    reviewCount: 98,
    courses: ["CENG 111", "CENG 140", "CENG 242"],
  },
  {
    id: "prof-3",
    name: "Mehmet Kaya",
    title: "Prof. Dr.",
    department: "MATH",
    rating: 3.8,
    takeAgainPercent: 58,
    reviewCount: 234,
    courses: ["MATH 119", "MATH 120", "MATH 260"],
  },
  {
    id: "prof-4",
    name: "Zeynep Arslan",
    title: "Dr. Öğr. Üyesi",
    department: "PHYS",
    rating: 4.0,
    takeAgainPercent: 65,
    reviewCount: 145,
    courses: ["PHYS 105", "PHYS 106"],
  },
  {
    id: "prof-5",
    name: "Can Özkan",
    title: "Doç. Dr.",
    department: "EE",
    rating: 4.3,
    takeAgainPercent: 78,
    reviewCount: 112,
    courses: ["EE 230", "EE 313", "EE 361"],
  },
  {
    id: "prof-6",
    name: "Ayşe Yıldız",
    title: "Prof. Dr.",
    department: "IE",
    rating: 4.6,
    takeAgainPercent: 92,
    reviewCount: 89,
    courses: ["IE 220", "IE 342"],
  },
  {
    id: "prof-7",
    name: "Burak Şahin",
    title: "Araş. Gör.",
    department: "CENG",
    rating: 4.1,
    takeAgainPercent: 68,
    reviewCount: 45,
    courses: ["CENG 111"],
  },
  {
    id: "prof-8",
    name: "Deniz Çelik",
    title: "Dr. Öğr. Üyesi",
    department: "CHEM",
    rating: 3.5,
    takeAgainPercent: 42,
    reviewCount: 178,
    courses: ["CHEM 101", "CHEM 102"],
  },
  {
    id: "prof-9",
    name: "Fatma Güneş",
    title: "Prof. Dr.",
    department: "PSY",
    rating: 4.7,
    takeAgainPercent: 95,
    reviewCount: 67,
    courses: ["PSY 100", "PSY 201", "PSY 305"],
  },
  {
    id: "prof-10",
    name: "Emre Tan",
    title: "Doç. Dr.",
    department: "ARCH",
    rating: 3.9,
    takeAgainPercent: 55,
    reviewCount: 34,
    courses: ["ARCH 101", "ARCH 102"],
  },
];

export default function HocalarPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [department, setDepartment] = useState("all");
  const [title, setTitle] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);

  // Ünvan chip'leri için aktif durumlar
  const titleChips = ["Prof. Dr.", "Doç. Dr.", "Dr. Öğr. Üyesi", "Araş. Gör."];

  // Filtreleme ve sıralama
  const filteredProfessors = useMemo(() => {
    let result = [...mockProfessors];

    // Arama filtresi
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((prof) =>
        prof.name.toLowerCase().includes(query)
      );
    }

    // Bölüm filtresi
    if (department !== "all") {
      result = result.filter((prof) => prof.department === department);
    }

    // Ünvan filtresi
    if (title !== "all") {
      result = result.filter((prof) => prof.title === title);
    }

    // Sıralama
    switch (sortBy) {
      case "popular":
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name, "tr"));
        break;
      case "take-again":
        result.sort((a, b) => b.takeAgainPercent - a.takeAgainPercent);
        break;
    }

    return result;
  }, [searchQuery, department, title, sortBy]);

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
            ODTÜ&apos;nün deneyimli rehberleri hakkında öğrenci yorumları
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

      {/* Sonuç Sayısı */}
      <div className="text-sm text-muted-foreground">
        {filteredProfessors.length} rehber bulundu
        {(searchQuery || department !== "all" || title !== "all") && (
          <span className="text-primary"> (filtrelenmiş)</span>
        )}
      </div>

      {/* Hoca Kartları Grid */}
      {filteredProfessors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProfessors.map((professor) => (
            <ProfessorCard key={professor.id} {...professor} />
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
            Arama kriterlerinize uygun hoca bulunamadı. Filtreleri değiştirmeyi deneyin.
          </p>
          <Button variant="outline" onClick={clearFilters}>
            Filtreleri Temizle
          </Button>
        </div>
      )}
    </div>
  );
}
