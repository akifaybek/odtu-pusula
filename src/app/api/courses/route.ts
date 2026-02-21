import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateSearchVariations } from "@/lib/search-utils";
import { errorResponse } from "@/lib/api-response";
import {
  classifyThrownError,
  completeRequestTrace,
  startRequestTrace,
} from "@/lib/observability";

const ALLOWED_SORTS = new Set([
  "popular",
  "rating",
  "difficulty-asc",
  "difficulty-desc",
  "name",
  "code",
]);

// Helper function to extract year from course code (e.g., CENG140 -> 1, CENG213 -> 2)
function getCourseYear(code: string): number | null {
  const match = code.match(/[A-Z]+(\d)/);
  if (match) {
    const firstDigit = parseInt(match[1], 10);
    if (firstDigit >= 1 && firstDigit <= 4) {
      return firstDigit;
    }
  }
  return null;
}

// GET /api/courses - Tüm dersleri listele
export async function GET(request: NextRequest) {
  const trace = startRequestTrace(request, "/api/courses");

  try {
    const { searchParams } = new URL(request.url);

    const departmentId = searchParams.get("departmentId");
    const departmentCode = searchParams.get("departmentCode");
    const search = searchParams.get("search")?.trim();
    const year = searchParams.get("year");
    const semester = searchParams.get("semester");

    const requestedSort = searchParams.get("sortBy") || "popular";
    const sortBy = ALLOWED_SORTS.has(requestedSort) ? requestedSort : "popular";

    const parsedPage = parseInt(searchParams.get("page") || "1", 10);
    const parsedLimit = parseInt(searchParams.get("limit") || "20", 10);
    const page = Number.isNaN(parsedPage) ? 1 : Math.max(1, parsedPage);
    const limit = Number.isNaN(parsedLimit)
      ? 20
      : Math.min(100, Math.max(1, parsedLimit));
    const skip = (page - 1) * limit;

    const where: {
      departmentId?: string;
      department?: { code: string };
      OR?: Array<{
        code?: { contains: string; mode: "insensitive" };
        name?: { contains: string; mode: "insensitive" };
      }>;
      reviews?: { some: { semester: string } };
    } = {};

    if (departmentId && departmentId !== "all") {
      where.departmentId = departmentId;
    } else if (departmentCode && departmentCode !== "all") {
      where.department = { code: departmentCode };
    }

    if (search) {
      const variations = generateSearchVariations(search);
      where.OR = [];

      variations.forEach((v) => {
        where.OR?.push({ code: { contains: v, mode: "insensitive" } });
        where.OR?.push({ name: { contains: v, mode: "insensitive" } });
      });
    }

    if (semester && semester !== "all") {
      where.reviews = { some: { semester } };
    }

    let courses = await prisma.course.findMany({
      where,
      select: {
        id: true,
        code: true,
        name: true,
        credits: true,
        description: true,
        courseType: true,
        department: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        professors: {
          select: {
            professor: {
              select: {
                id: true,
                name: true,
                title: true,
              },
            },
          },
        },
        reviews: {
          select: {
            semester: true,
            difficultyRating: true,
            workloadRating: true,
            usefulnessRating: true,
            overallRating: true,
          },
        },
      },
    });

    if (year && year !== "all") {
      const yearNum = parseInt(year, 10);
      if (!Number.isNaN(yearNum)) {
        courses = courses.filter((course) => getCourseYear(course.code) === yearNum);
      }
    }

    const coursesWithStats = courses.map((course) => {
      const reviews =
        semester && semester !== "all"
          ? course.reviews.filter((r) => r.semester === semester)
          : course.reviews;
      const reviewCount = reviews.length;

      let avgDifficulty = 0;
      let avgWorkload = 0;
      let avgUsefulness = 0;
      let avgOverall = 0;

      if (reviewCount > 0) {
        avgDifficulty = reviews.reduce((sum, r) => sum + r.difficultyRating, 0) / reviewCount;
        avgWorkload = reviews.reduce((sum, r) => sum + r.workloadRating, 0) / reviewCount;
        avgUsefulness = reviews.reduce((sum, r) => sum + r.usefulnessRating, 0) / reviewCount;
        avgOverall = reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviewCount;
      }

      return {
        id: course.id,
        code: course.code,
        name: course.name,
        credits: course.credits,
        description: course.description,
        courseType: course.courseType,
        department: course.department,
        year: getCourseYear(course.code),
        professors: course.professors.map((cp) => cp.professor),
        reviewCount,
        stats: {
          difficulty: Math.round(avgDifficulty * 10) / 10,
          workload: Math.round(avgWorkload * 10) / 10,
          usefulness: Math.round(avgUsefulness * 10) / 10,
          overall: Math.round(avgOverall * 10) / 10,
        },
      };
    });

    const sortedCourses = [...coursesWithStats].sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.reviewCount - a.reviewCount;
        case "rating":
          return b.stats.overall - a.stats.overall;
        case "difficulty-asc":
          return a.stats.difficulty - b.stats.difficulty;
        case "difficulty-desc":
          return b.stats.difficulty - a.stats.difficulty;
        case "name":
          return a.name.localeCompare(b.name, "tr");
        case "code":
          return a.code.localeCompare(b.code);
        default:
          return b.reviewCount - a.reviewCount;
      }
    });

    const total = sortedCourses.length;
    const paginatedCourses = sortedCourses.slice(skip, skip + limit);

    return completeRequestTrace(
      trace,
      NextResponse.json({
        courses: paginatedCourses,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
    );
  } catch (error) {
    const response = errorResponse(500, "INTERNAL_ERROR", "Dersler yüklenirken bir hata oluştu", {
      endpoint: "/api/courses",
      requestId: trace.requestId,
      correlationId: trace.correlationId,
    });

    return completeRequestTrace(trace, response, {
      error,
      errorClass: classifyThrownError(error),
    });
  }
}
