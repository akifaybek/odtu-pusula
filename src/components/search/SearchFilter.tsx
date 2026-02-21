"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, Filter, X } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Re-export SearchFilters type from actions for consistency
export type { SearchFilters } from "@/actions/search";

const DEPARTMENTS = [
    { code: "CENG", name: "Computer Engineering" },
    { code: "EE", name: "Electrical and Electronics" },
    { code: "IE", name: "Industrial Engineering" },
    { code: "ME", name: "Mechanical Engineering" },
    { code: "ARCH", name: "Architecture" },
    { code: "ECON", name: "Economics" },
    { code: "PHYS", name: "Physics" },
    // Add more as needed
];

export default function SearchFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Local state for filters
    const [query, setQuery] = useState(searchParams.get("q") || "");
    const [department, setDepartment] = useState(searchParams.get("dept") || "all");
    const [minRating, setMinRating] = useState(searchParams.get("minRating") === "4");
    const [maxDifficulty, setMaxDifficulty] = useState(searchParams.get("maxDifficulty") === "3");
    const [sortBy, setSortBy] = useState(searchParams.get("sort") || "rating"); // rating, reviews, newest

    // Debounce query to avoid too many URL updates
    const [debouncedQuery, setDebouncedQuery] = useState(query);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 500);
        return () => clearTimeout(timer);
    }, [query]);

    // Sync state with URL
    useEffect(() => {
        const params = new URLSearchParams(searchParams.toString());

        if (debouncedQuery) params.set("q", debouncedQuery);
        else params.delete("q");

        if (department && department !== "all") params.set("dept", department);
        else params.delete("dept");

        if (minRating) params.set("minRating", "4");
        else params.delete("minRating");

        if (maxDifficulty) params.set("maxDifficulty", "3");
        else params.delete("maxDifficulty");

        if (sortBy) params.set("sort", sortBy);
        else params.delete("sort");

        router.push(`?${params.toString()}`, { scroll: false });
    }, [debouncedQuery, department, minRating, maxDifficulty, sortBy, router, searchParams]);

    const clearFilters = () => {
        setQuery("");
        setDepartment("all");
        setMinRating(false);
        setMaxDifficulty(false);
        setSortBy("rating");
        router.push("/search");
    };

    return (
        <div className="bg-card border border-border/50 rounded-xl p-5 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Filter className="h-5 w-5 text-primary" />
                    Filters
                </h2>
                {(query || department !== "all" || minRating || maxDifficulty) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-muted-foreground hover:text-destructive h-8 px-2"
                    >
                        Clear
                        <X className="ml-1 h-3 w-3" />
                    </Button>
                )}
            </div>

            <div className="space-y-4">
                {/* Search Query */}
                <div className="space-y-2">
                    <Label>Search</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search code, name..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                </div>

                {/* Department */}
                <div className="space-y-2">
                    <Label>Department</Label>
                    <Select value={department} onValueChange={setDepartment}>
                        <SelectTrigger>
                            <SelectValue placeholder="All Departments" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Departments</SelectItem>
                            {DEPARTMENTS.map((dept) => (
                                <SelectItem key={dept.code} value={dept.code}>
                                    {dept.code} - {dept.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Sort By */}
                <div className="space-y-2">
                    <Label>Sort By</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger>
                            <SelectValue placeholder="Sort By" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="rating">Highest Rating</SelectItem>
                            <SelectItem value="reviews">Most Reviewed</SelectItem>
                            <SelectItem value="newest">Newest</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3 pt-2">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="minRating"
                            checked={minRating}
                            onCheckedChange={(checked) => setMinRating(checked as boolean)}
                        />
                        <Label htmlFor="minRating" className="cursor-pointer font-normal">
                            High Rating (4.0+)
                        </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="maxDifficulty"
                            checked={maxDifficulty}
                            onCheckedChange={(checked) => setMaxDifficulty(checked as boolean)}
                        />
                        <Label htmlFor="maxDifficulty" className="cursor-pointer font-normal">
                            Easy (Difficulty ≤ 3.0)
                        </Label>
                    </div>
                </div>
            </div>
        </div>
    );
}
