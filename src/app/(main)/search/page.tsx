import { Suspense } from "react";
import SearchFilter, { SearchFilters } from "@/components/search/SearchFilter";
import { searchCourses, searchProfessors } from "@/actions/search";
import CourseCard from "@/components/course/CourseCard";
import ProfessorCard from "@/components/professor/ProfessorCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const dynamic = "force-dynamic";

type PageProps = {
    searchParams: SearchFilters & { type?: string };
};

export default async function SearchPage({ searchParams }: PageProps) {
    // Await searchParams before accessing properties
    const resolvedSearchParams = await Promise.resolve(searchParams);

    const type = resolvedSearchParams.type || "courses";
    const filters: SearchFilters = {
        q: resolvedSearchParams.q,
        dept: resolvedSearchParams.dept,
        minRating: resolvedSearchParams.minRating,
        maxDifficulty: resolvedSearchParams.maxDifficulty,
        sort: resolvedSearchParams.sort,
    };

    const courses = type === "courses" ? await searchCourses(filters) : [];
    const professors = type === "professors" ? await searchProfessors(filters) : [];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Filters */}
                <div className="w-full lg:w-1/4 space-y-6">
                    <Suspense fallback={<div>Loading filters...</div>}>
                        <SearchFilter />
                    </Suspense>
                </div>

                {/* Results Area */}
                <div className="w-full lg:w-3/4">
                    <div className="bg-card rounded-xl p-4 mb-6 shadow-sm border border-border/50">
                        <h1 className="text-2xl font-bold mb-2">Search Results</h1>
                        <p className="text-muted-foreground text-sm">
                            {type === "courses"
                                ? `Found ${courses.length} courses`
                                : `Found ${professors.length} professors`
                            } for your search.
                        </p>
                    </div>

                    <Tabs defaultValue={type} className="w-full">
                        <div className="flex items-center justify-between mb-6">
                            <TabsList>
                                <TabsTrigger
                                    value="courses"
                                // Using client-side navigation or a wrapper is better, but simple link works too
                                // For now, relying on tabs to switch visible content IF we fetched both, 
                                // but we only fetched one to save bandwidth.
                                // Real implementation: Link to ?type=courses...
                                >
                                    <a href={`/search?type=courses&q=${filters.q || ""}`}>Courses</a>
                                </TabsTrigger>
                                <TabsTrigger value="professors">
                                    <a href={`/search?type=professors&q=${filters.q || ""}`}>Professors</a>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="courses" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {courses.length > 0 ? (
                                    courses.map((course, index) => (
                                        <CourseCard
                                            key={course.id}
                                            index={index}
                                            code={course.code}
                                            name={course.name}
                                            department={course.department.code}
                                            credits={course.credits}
                                            difficulty={course.avgDifficulty}
                                            rating={course.avgRating}
                                            reviewCount={course.reviewCount}
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-2 text-center py-12 text-muted-foreground">
                                        No courses found matching your criteria.
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="professors" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {professors.length > 0 ? (
                                    professors.map((prof, index) => (
                                        <ProfessorCard
                                            key={prof.id}
                                            index={index}
                                            id={prof.id}
                                            name={prof.name}
                                            title={prof.title}
                                            department={prof.department.code}
                                            rating={prof.avgRating}
                                            takeAgainPercent={prof.takeAgainPercent}
                                            reviewCount={prof.reviewCount}
                                            courses={prof.courseCodes}
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-2 text-center py-12 text-muted-foreground">
                                        No professors found matching your criteria.
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
