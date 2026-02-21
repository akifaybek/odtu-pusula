import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Title } from "@prisma/client";
import { errorResponse } from "@/lib/api-response";

const titleMap: Record<Title, string> = {
  PROF_DR: "Prof. Dr.",
  ASSOC_PROF_DR: "Doç. Dr.",
  ASST_PROF_DR: "Dr. Öğr. Üyesi",
  LECTURER: "Öğr. Gör.",
  RES_ASST: "Arş. Gör.",
};

const ALLOWED_SORTS = new Set([
  "newest",
  "oldest",
  "most-liked",
  "highest-rating",
  "lowest-rating",
]);

// GET /api/professors/[id] - Hoca detay
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id?.trim()) {
      return errorResponse(400, "BAD_REQUEST", "Hoca id zorunludur", {
        endpoint: "/api/professors/[id]",
      });
    }

    const { searchParams } = new URL(request.url);
    const parsedPage = parseInt(searchParams.get("reviewsPage") || "1", 10);
    const parsedLimit = parseInt(searchParams.get("reviewsLimit") || "10", 10);
    const reviewsPage = Number.isNaN(parsedPage) ? 1 : Math.max(1, parsedPage);
    const reviewsLimit = Number.isNaN(parsedLimit)
      ? 10
      : Math.min(50, Math.max(1, parsedLimit));
    const reviewsSkip = (reviewsPage - 1) * reviewsLimit;

    const requestedSort = searchParams.get("sortBy") || "newest";
    const sortBy = ALLOWED_SORTS.has(requestedSort) ? requestedSort : "newest";

    const professor = await prisma.professor.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        title: true,
        email: true,
        image: true,
        department: {
          select: {
            id: true,
            code: true,
            name: true,
            faculty: true,
          },
        },
        courses: {
          select: {
            course: {
              select: {
                id: true,
                code: true,
                name: true,
                credits: true,
              },
            },
          },
        },
      },
    });

    if (!professor) {
      return errorResponse(404, "NOT_FOUND", "Hoca bulunamadı", {
        endpoint: "/api/professors/[id]",
        id,
      });
    }

    const allReviews = await prisma.professorReview.findMany({
      where: { professorId: id },
      select: {
        teachingRating: true,
        gradingRating: true,
        accessRating: true,
        overallRating: true,
        wouldTakeAgain: true,
      },
    });

    const reviewCount = allReviews.length;
    let stats = {
      teaching: 0,
      grading: 0,
      accessibility: 0,
      overall: 0,
      wouldTakeAgainPercent: 0,
    };

    if (reviewCount > 0) {
      stats = {
        teaching:
          Math.round(
            (allReviews.reduce((sum, r) => sum + r.teachingRating, 0) / reviewCount) * 10
          ) / 10,
        grading:
          Math.round(
            (allReviews.reduce((sum, r) => sum + r.gradingRating, 0) / reviewCount) * 10
          ) / 10,
        accessibility:
          Math.round(
            (allReviews.reduce((sum, r) => sum + r.accessRating, 0) / reviewCount) * 10
          ) / 10,
        overall:
          Math.round(
            (allReviews.reduce((sum, r) => sum + r.overallRating, 0) / reviewCount) * 10
          ) / 10,
        wouldTakeAgainPercent: Math.round(
          (allReviews.filter((r) => r.wouldTakeAgain).length / reviewCount) * 100
        ),
      };
    }

    let orderBy: { createdAt?: "asc" | "desc"; likes?: "asc" | "desc"; overallRating?: "asc" | "desc" } = {
      createdAt: "desc",
    };

    switch (sortBy) {
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "most-liked":
        orderBy = { likes: "desc" };
        break;
      case "highest-rating":
        orderBy = { overallRating: "desc" };
        break;
      case "lowest-rating":
        orderBy = { overallRating: "asc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const reviews = await prisma.professorReview.findMany({
      where: { professorId: id },
      select: {
        id: true,
        semester: true,
        teachingRating: true,
        gradingRating: true,
        accessRating: true,
        overallRating: true,
        wouldTakeAgain: true,
        comment: true,
        isAnonymous: true,
        likes: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        course: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy,
      skip: reviewsSkip,
      take: reviewsLimit,
    });

    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      semester: review.semester,
      teachingRating: review.teachingRating,
      gradingRating: review.gradingRating,
      accessRating: review.accessRating,
      overallRating: review.overallRating,
      wouldTakeAgain: review.wouldTakeAgain,
      comment: review.comment,
      isAnonymous: review.isAnonymous,
      likes: review.likes,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
      user:
        review.isAnonymous || !review.user
          ? null
          : {
              id: review.user.id,
              name: review.user.name,
            },
      course: review.course,
    }));

    return NextResponse.json({
      professor: {
        id: professor.id,
        name: professor.name,
        title: titleMap[professor.title],
        titleEnum: professor.title,
        email: professor.email,
        image: professor.image,
        department: professor.department,
        courses: professor.courses.map((cp) => cp.course),
      },
      stats: {
        ...stats,
        reviewCount,
      },
      reviews: {
        data: formattedReviews,
        pagination: {
          page: reviewsPage,
          limit: reviewsLimit,
          total: reviewCount,
          totalPages: Math.ceil(reviewCount / reviewsLimit),
        },
      },
    });
  } catch (error) {
    console.error("Professor detail GET error:", error);
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "Hoca bilgileri yüklenirken bir hata oluştu",
      {
        endpoint: "/api/professors/[id]",
      }
    );
  }
}
