"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, SlidersHorizontal, Map, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import PageTransition from "@/components/shared/PageTransition";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CourseCard from "@/components/course/CourseCard";
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

type CourseType = "REQUIRED" | "ELECTIVE" | "TECH_ELECTIVE" | "NON_TECH" | "FREE_ELECTIVE";

interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  courseType?: CourseType | null;
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

export default function CoursesPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [department, setDepartment] = useState("all");
  const [year, setYear] = useState("all");
  const [semester, setSemester] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCourses, setTotalCourses] = useState(0);

  // Debounced search
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Departments with translations
  const departments = [
    { value: "all", label: t("courses.allDepartments") },
    ...departmentCodes.map(code => ({ value: code, label: t(`departments.${code}`) }))
  ];

  // Year options
  const yearOptions = [
    { value: "all", label: t("courses.allYears") },
    { value: "1", label: t("courses.year1") },
    { value: "2", label: t("courses.year2") },
    { value: "3", label: t("courses.year3") },
    { value: "4", label: t("courses.year4") },
  ];

  // Sort options with translations
  const sortOptions = [
    { value: "popular", label: t("courses.sortOptions.popular") },
    { value: "rating", label: t("courses.sortOptions.rating") },
    { value: "difficulty-asc", label: t("courses.sortOptions.difficultyAsc") },
    { value: "difficulty-desc", label: t("courses.sortOptions.difficultyDesc") },
    { value: "name", label: t("courses.sortOptions.name") },
    { value: "code", label: t("courses.sortOptions.code") },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to page 1 on search
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
        params.set("departmentCode", department);
      }
      if (year !== "all") {
        params.set("year", year);
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

      const response = await fetch(`/api/courses?${params.toString()}`);

      if (!response.ok) {
        throw new Error(t("errors.loadingCourses"));
      }

      const data: CoursesResponse = await response.json();
      setCourses(data.courses);
      setTotalCourses(data.pagination.total);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setLoading(false);
    }
  }, [department, year, semester, debouncedSearch, sortBy, page, t]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // When filters change, reset page
  const handleDepartmentChange = (val: string) => {
    setDepartment(val);
    setPage(1);
  };

  const handleYearChange = (val: string) => {
    setYear(val);
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
    setYear("all");
    setSemester("all");
    setSearchQuery("");
    setPage(1);
  };

  const displayedCourses = courses;

  const activeFiltersCount = [department !== "all", year !== "all", semester !== "all", searchQuery !== ""].filter(Boolean).length;


  return (
    <PageTransition className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <Map className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("courses.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? t("common.loading") : t("courses.discoverAmong", { count: totalCourses })}
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
              placeholder={t("courses.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border/50 focus:border-primary/50 text-base py-4 shadow-sm"
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
              "lg:hidden border-border/50 h-[52px]",
              activeFiltersCount > 0 && "border-primary/50 text-primary"
            )}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            {t("common.filter")}
            {activeFiltersCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-xs">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>

        {/* Filters - Desktop */}
        <div
          className={cn(
            "flex flex-wrap gap-3",
            "lg:flex",
            showFilters ? "flex" : "hidden"
          )}
        >
          <Select value={department} onValueChange={handleDepartmentChange}>
            <SelectTrigger className="w-full sm:w-[200px] bg-card border-border/50 h-10">
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

          <Select value={year} onValueChange={handleYearChange}>
            <SelectTrigger className="w-full sm:w-[140px] bg-card border-border/50 h-10">
              <SelectValue placeholder={t("courses.year")} />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={semester} onValueChange={handleSemesterChange}>
            <SelectTrigger className="w-full sm:w-[180px] bg-card border-border/50 h-10">
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
            <SelectTrigger className="w-full sm:w-[160px] bg-card border-border/50 h-10">
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

      {/* Loading State - Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl overflow-hidden border border-border/50 shadow-sm p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <div className="space-y-2 pt-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
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
          <Button onClick={fetchCourses}>{t("common.tryAgain")}</Button>
        </div>
      )}

      {/* Results Count */}
      {!loading && !error && (
        <>
          <div className="text-sm text-muted-foreground">
            {t("courses.coursesFound", { count: totalCourses })}
            {(searchQuery || department !== "all" || year !== "all") && (
              <span className="text-primary"> {t("courses.filtered")}</span>
            )}
          </div>

          {/* Course Cards Grid */}
          {displayedCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayedCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  code={course.code}
                  name={course.name}
                  department={course.department.code}
                  credits={course.credits}
                  difficulty={course.stats.difficulty}
                  rating={course.stats.overall}
                  reviewCount={course.reviewCount}
                  courseType={course.courseType}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <EmptyState
              icon={Map}
              title={t("courses.noCourses")}
              description={t("courses.noCoursesDescription")}
              action={{
                label: t("courses.clearFilters"),
                onClick: clearFilters
              }}
            />
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
    </PageTransition>
  );
}
