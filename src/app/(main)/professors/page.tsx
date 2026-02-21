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
import { useTranslation } from "@/contexts/LanguageContext";

// Department codes
const departmentCodes = [
  // Faculty of Architecture
  "ID", "ARCH", "CRP",
  // Faculty of Arts and Sciences
  "BIOL", "PHIL", "PHYS", "STAT", "CHEM", "MATH", "MFGE", "PSY", "SOC", "HIST",
  // Faculty of Economic and Administrative Sciences
  "ECON", "BA", "ADM", "IR",
  // Faculty of Education
  "PES", "CEIT", "SSME", "ELE", "FLE", "EDS",
  // Faculty of Engineering
  "CENG", "ENVE", "EE", "IE", "FDE", "AEE", "CE", "GEOE", "CHE", "MINE", "ME", "METE", "PETE", "ESE",
  // Graduate School of Informatics
  "IS", "II"
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

// Semester options
const semesterOptions = [
  { value: "all", labelKey: "professors.allSemesters" },
  { value: "2025-2026 Spring", label: "2025-2026 Bahar" },
  { value: "2025-2026 Fall", label: "2025-2026 Güz" },
  { value: "2024-2025 Spring", label: "2024-2025 Bahar" },
  { value: "2024-2025 Fall", label: "2024-2025 Güz" },
  { value: "2023-2024 Spring", label: "2023-2024 Bahar" },
  { value: "2023-2024 Fall", label: "2023-2024 Güz" },
];

export default function ProfessorsPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [department, setDepartment] = useState("all");
  const [title, setTitle] = useState("all");
  const [semester, setSemester] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);

  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProfessors, setTotalProfessors] = useState(0);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Departments with translations
  const departments = [
    { value: "all", label: t("courses.allDepartments") },
    ...departmentCodes.map(code => ({ value: code, label: t(`departments.${code}`) }))
  ];

  // Sort options with translations
  const sortOptions = [
    { value: "popular", label: t("professors.sortOptions.popular") },
    { value: "rating", label: t("professors.sortOptions.rating") },
    { value: "name", label: t("professors.sortOptions.name") },
    { value: "take-again", label: t("professors.sortOptions.takeAgain") },
  ];

  // Title chips
  const titleChips = ["Prof. Dr.", "Doç. Dr.", "Dr. Öğr. Üyesi", "Arş. Gör."];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to page 1 on search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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
      if (semester !== "all") {
        params.set("semester", semester);
      }
      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      }
      params.set("sortBy", sortBy);
      params.set("page", page.toString());
      params.set("limit", "30");

      const response = await fetch(`/api/professors?${params.toString()}`);

      if (!response.ok) {
        throw new Error(t("errors.loadingProfessors"));
      }

      const data: ProfessorsResponse = await response.json();
      setProfessors(data.professors);
      setTotalProfessors(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setLoading(false);
    }
  }, [department, title, semester, debouncedSearch, sortBy, page, t]);

  useEffect(() => {
    fetchProfessors();
  }, [fetchProfessors]);

  const activeFiltersCount = [
    department !== "all",
    title !== "all",
    semester !== "all",
  ].filter(Boolean).length;

  const handleDepartmentChange = (val: string) => {
    setDepartment(val);
    setPage(1);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setPage(1);
  };

  const handleSemesterChange = (val: string) => {
    setSemester(val);
    setPage(1);
  };

  const handleSortChange = (val: string) => {
    setSortBy(val);
    setPage(1);
  };

  const clearFilters = () => {
    setDepartment("all");
    setTitle("all");
    setSemester("all");
    setSearchQuery("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("professors.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? t("common.loading") : t("professors.discoverAmong", { count: totalProfessors })}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("professors.searchPlaceholder")}
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

          {/* Mobile filter button */}
          <Button
            variant="outline"
            className={cn(
              "lg:hidden border-border/50",
              activeFiltersCount > 0 && "border-primary/50 text-primary"
            )}
            onClick={() => setShowFilters(!showFilters)}
          >
            {t("common.filter")}
            {activeFiltersCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-xs">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>

        {/* Title Chips */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleTitleChange("all")}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
              title === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
            )}
          >
            {t("common.all")}
          </button>
          {titleChips.map((titleValue) => (
            <button
              key={titleValue}
              onClick={() => handleTitleChange(title === titleValue ? "all" : titleValue)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                title === titleValue
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
              )}
            >
              {titleValue}
            </button>
          ))}
        </div>

        {/* Other Filters */}
        <div
          className={cn(
            "flex flex-wrap gap-3",
            "lg:flex",
            showFilters ? "flex" : "hidden"
          )}
        >
          <Select value={department} onValueChange={handleDepartmentChange}>
            <SelectTrigger className="w-full sm:w-[200px] bg-card border-border/50">
              <SelectValue placeholder={t("courses.department")} />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.value} value={dept.value}>
                  {dept.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={semester} onValueChange={handleSemesterChange}>
            <SelectTrigger className="w-full sm:w-[180px] bg-card border-border/50">
              <SelectValue placeholder={t("professors.semester")} />
            </SelectTrigger>
            <SelectContent>
              {semesterOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.value === "all" ? t("professors.allSemesters") : opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-[180px] bg-card border-border/50">
              <SelectValue placeholder={t("courses.sort")} />
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
              {t("common.clear")}
            </Button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">{t("professors.loadingProfessors")}</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
            <X className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            {t("common.error")}
          </h3>
          <p className="text-muted-foreground max-w-sm mb-4">{error}</p>
          <Button onClick={fetchProfessors}>{t("common.tryAgain")}</Button>
        </div>
      )}

      {/* Results Count */}
      {!loading && !error && (
        <>
          <div className="text-sm text-muted-foreground">
            {t("professors.professorsFound", { count: professors.length })}
            {(searchQuery || department !== "all" || title !== "all" || semester !== "all") && (
              <span className="text-primary"> {t("courses.filtered")}</span>
            )}
          </div>

          {/* Professor Cards Grid */}
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
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {t("professors.noProfessors")}
              </h3>
              <p className="text-muted-foreground max-w-sm mb-4">
                {t("professors.noProfessorsDescription")}
              </p>
              <Button variant="outline" onClick={clearFilters}>
                {t("courses.clearFilters")}
              </Button>
            </div>
          )}
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => {
                  setPage(p => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={page <= 1}
              >
                {t("pagination.previous")}
              </Button>
              <div className="text-sm font-medium">
                {t("pagination.page")} {page} / {totalPages}
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setPage(p => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={page >= totalPages}
              >
                {t("pagination.next")}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
