import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Title } from "@prisma/client";
import { generateSearchVariations } from "@/lib/search-utils";
import { errorResponse } from "@/lib/api-response";
import {
  classifyThrownError,
  completeRequestTrace,
  startRequestTrace,
} from "@/lib/observability";

const ALLOWED_SORTS = new Set(["popular", "rating", "name", "take-again"]);

// Türkçe unvan mapping
const titleMap: Record<Title, string> = {
  PROF_DR: "Prof. Dr.",
  ASSOC_PROF_DR: "Doç. Dr.",
  ASST_PROF_DR: "Dr. Öğr. Üyesi",
  LECTURER: "Öğr. Gör.",
  RES_ASST: "Arş. Gör.",
};

// GET /api/professors - Tüm hocaları listele
export async function GET(request: NextRequest) {
  const trace = startRequestTrace(request, "/api/professors");

  try {
    const { searchParams } = new URL(request.url);

    const departmentCode = searchParams.get("departmentCode");
    const search = searchParams.get("search")?.trim();
    const title = searchParams.get("title");
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
      department?: { code: string };
      title?: Title;
      OR?: Array<{ name: { contains: string; mode: "insensitive" } }>;
      reviews?: { some: { semester: string } };
    } = {};

    if (departmentCode && departmentCode !== "all") {
      where.department = { code: departmentCode };
    }

    if (title && title !== "all") {
      const titleEntry = Object.entries(titleMap).find(([, value]) => value === title);
      if (titleEntry) {
        where.title = titleEntry[0] as Title;
      } else {
        return errorResponse(400, "BAD_REQUEST", "Geçersiz unvan filtresi", {
          endpoint: "/api/professors",
          title,
        });
      }
    }

    if (search) {
      const variations = generateSearchVariations(search);
      where.OR = [];
      variations.forEach((v) => {
        where.OR?.push({ name: { contains: v, mode: "insensitive" } });
      });
    }

    if (semester && semester !== "all") {
      where.reviews = { some: { semester } };
    }

    const professors = await prisma.professor.findMany({
      where,
      select: {
        id: true,
        name: true,
        title: true,
        department: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        courses: {
          select: {
            course: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
        reviews: {
          select: {
            semester: true,
            teachingRating: true,
            gradingRating: true,
            accessRating: true,
            overallRating: true,
            wouldTakeAgain: true,
          },
        },
      },
    });

    const professorsWithStats = professors.map((professor) => {
      const reviews =
        semester && semester !== "all"
          ? professor.reviews.filter((r) => r.semester === semester)
          : professor.reviews;
      const reviewCount = reviews.length;

      let avgTeaching = 0;
      let avgGrading = 0;
      let avgAccess = 0;
      let avgOverall = 0;
      let wouldTakeAgainPercent = 0;

      if (reviewCount > 0) {
        avgTeaching = reviews.reduce((sum, r) => sum + r.teachingRating, 0) / reviewCount;
        avgGrading = reviews.reduce((sum, r) => sum + r.gradingRating, 0) / reviewCount;
        avgAccess = reviews.reduce((sum, r) => sum + r.accessRating, 0) / reviewCount;
        avgOverall = reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviewCount;
        wouldTakeAgainPercent =
          (reviews.filter((r) => r.wouldTakeAgain).length / reviewCount) * 100;
      }

      return {
        id: professor.id,
        name: professor.name,
        title: titleMap[professor.title],
        titleEnum: professor.title,
        department: professor.department,
        courses: professor.courses.map((cp) => cp.course),
        reviewCount,
        stats: {
          teaching: Math.round(avgTeaching * 10) / 10,
          grading: Math.round(avgGrading * 10) / 10,
          accessibility: Math.round(avgAccess * 10) / 10,
          overall: Math.round(avgOverall * 10) / 10,
          wouldTakeAgainPercent: Math.round(wouldTakeAgainPercent),
        },
      };
    });

    const sortedProfessors = [...professorsWithStats].sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.reviewCount - a.reviewCount;
        case "rating":
          return b.stats.overall - a.stats.overall;
        case "name":
          return a.name.localeCompare(b.name, "tr");
        case "take-again":
          return b.stats.wouldTakeAgainPercent - a.stats.wouldTakeAgainPercent;
        default:
          return b.reviewCount - a.reviewCount;
      }
    });

    const total = sortedProfessors.length;
    const paginatedProfessors = sortedProfessors.slice(skip, skip + limit);

    return completeRequestTrace(
      trace,
      NextResponse.json({
        professors: paginatedProfessors,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
    );
  } catch (error) {
    const response = errorResponse(500, "INTERNAL_ERROR", "Hocalar yüklenirken bir hata oluştu", {
      endpoint: "/api/professors",
      requestId: trace.requestId,
      correlationId: trace.correlationId,
    });

    return completeRequestTrace(trace, response, {
      error,
      errorClass: classifyThrownError(error),
    });
  }
}
