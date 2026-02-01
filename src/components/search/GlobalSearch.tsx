"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  BookOpen,
  User,
  Loader2,
  Star,
  Command,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  courses: Array<{
    code: string;
    name: string;
    department: string;
    rating: number;
  }>;
  professors: Array<{
    id: string;
    name: string;
    title: string;
    department: string;
    rating: number;
  }>;
}

export default function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&limit=5`
        );
        const data = await response.json();
        setResults(data);
        setIsOpen(true);
        setSelectedIndex(0);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (event.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Flatten results for keyboard navigation
  const flatResults = useCallback(() => {
    if (!results) return [];
    const items: Array<{ type: "course" | "professor"; item: unknown }> = [];

    results.courses.forEach((course) => {
      items.push({ type: "course", item: course });
    });
    results.professors.forEach((professor) => {
      items.push({ type: "professor", item: professor });
    });

    return items;
  }, [results]);

  // Keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    const items = flatResults();
    if (items.length === 0) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % items.length);
        break;
      case "ArrowUp":
        event.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
        break;
      case "Enter":
        event.preventDefault();
        const selected = items[selectedIndex];
        if (selected) {
          navigateToResult(selected);
        }
        break;
    }
  };

  const navigateToResult = (result: { type: "course" | "professor"; item: unknown }) => {
    setIsOpen(false);
    setQuery("");
    if (result.type === "course") {
      const course = result.item as { code: string };
      router.push(`/dersler/${course.code}`);
    } else {
      const professor = result.item as { id: string };
      router.push(`/hocalar/${professor.id}`);
    }
  };

  const hasResults =
    results && (results.courses.length > 0 || results.professors.length > 0);

  let currentIndex = 0;

  return (
    <div ref={containerRef} className="relative">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Ders veya hoca ara..."
          className="w-full h-9 pl-9 pr-16 rounded-lg border border-border/50 bg-muted/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : query ? (
            <button
              onClick={() => {
                setQuery("");
                setResults(null);
                setIsOpen(false);
              }}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-border bg-muted text-[10px] font-medium text-muted-foreground">
              <Command className="h-3 w-3" />K
            </kbd>
          )}
        </div>
      </div>

      {/* Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
          {hasResults ? (
            <div className="max-h-[400px] overflow-y-auto">
              {/* Courses */}
              {results.courses.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/50">
                    Dersler
                  </div>
                  {results.courses.map((course) => {
                    const itemIndex = currentIndex++;
                    return (
                      <button
                        key={course.code}
                        onClick={() =>
                          navigateToResult({ type: "course", item: course })
                        }
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                          selectedIndex === itemIndex
                            ? "bg-primary/10"
                            : "hover:bg-muted/50"
                        )}
                      >
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <BookOpen className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">
                              {course.code}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {course.department}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {course.name}
                          </p>
                        </div>
                        {course.rating > 0 && (
                          <div className="flex items-center gap-1 text-sm text-amber-500">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            {course.rating.toFixed(1)}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Professors */}
              {results.professors.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/50">
                    Hocalar
                  </div>
                  {results.professors.map((professor) => {
                    const itemIndex = currentIndex++;
                    return (
                      <button
                        key={professor.id}
                        onClick={() =>
                          navigateToResult({ type: "professor", item: professor })
                        }
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                          selectedIndex === itemIndex
                            ? "bg-primary/10"
                            : "hover:bg-muted/50"
                        )}
                      >
                        <div className="p-2 rounded-lg bg-emerald-500/10">
                          <User className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">
                              {professor.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {professor.department}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {professor.title}
                          </p>
                        </div>
                        {professor.rating > 0 && (
                          <div className="flex items-center gap-1 text-sm text-amber-500">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            {professor.rating.toFixed(1)}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : query.length >= 2 && !isLoading ? (
            <div className="px-4 py-8 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Sonuç bulunamadı</p>
              <p className="text-xs mt-1">Farklı bir arama terimi deneyin</p>
            </div>
          ) : null}

          {/* Footer hint */}
          {hasResults && (
            <div className="px-3 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
              <span>
                <kbd className="px-1 py-0.5 rounded border border-border bg-background mr-1">
                  ↑↓
                </kbd>
                ile gezin,
                <kbd className="px-1 py-0.5 rounded border border-border bg-background mx-1">
                  Enter
                </kbd>
                ile seçin
              </span>
              <span>
                <kbd className="px-1 py-0.5 rounded border border-border bg-background">
                  Esc
                </kbd>
                kapat
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
