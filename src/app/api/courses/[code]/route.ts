import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { errorResponse } from "@/lib/api-response";

const ALLOWED_SORTS = new Set([
  "newest",
  "oldest",
  "most-liked",
  "highest-rating",
  "lowest-rating",
]);

// GET /api/courses/[code] - Ders detay
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    if (!code?.trim()) {
      return errorResponse(400, "BAD_REQUEST", "Ders kodu zorunludur", {
        endpoint: "/api/courses/[code]",
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

    // Ders kodunu normalize et (CENG-331 -> CENG331)
    const normalizedCode = code.replace(/-/g, "").toUpperCase();

    // Dersi bul (sadece gerekli alanlar)
    const course = await prisma.course.findFirst({
      where: {
        OR: [
          { code: normalizedCode },
          { code: code.toUpperCase() },
          { code: { contains: normalizedCode, mode: "insensitive" } },
        ],
      },
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
            faculty: true,
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
      },
    });

    if (!course) {
      return errorResponse(404, "NOT_FOUND", "Ders bulunamadı", {
        endpoint: "/api/courses/[code]",
        code,
      });
    }

    // Tüm reviews için istatistik hesapla
    const allReviews = await prisma.courseReview.findMany({
      where: { courseId: course.id },
      select: {
        difficultyRating: true,
        workloadRating: true,
        usefulnessRating: true,
        overallRating: true,
        wouldRecommend: true,
        grade: true,
      },
    });

    const reviewCount = allReviews.length;
    let stats = {
      difficulty: 0,
      workload: 0,
      usefulness: 0,
      overall: 0,
      recommendPercent: 0,
    };

    const gradeDistribution: Record<string, number> = {};
    allReviews.forEach((r) => {
      if (r.grade) {
        gradeDistribution[r.grade] = (gradeDistribution[r.grade] || 0) + 1;
      }
    });

    if (reviewCount > 0) {
      const recommendCount = allReviews.filter((r) => r.wouldRecommend === true).length;
      const totalRecommendResponses = allReviews.filter((r) => r.wouldRecommend !== null).length;

      stats = {
        difficulty:
          Math.round(
            (allReviews.reduce((sum, r) => sum + r.difficultyRating, 0) / reviewCount) * 10
          ) / 10,
        workload:
          Math.round(
            (allReviews.reduce((sum, r) => sum + r.workloadRating, 0) / reviewCount) * 10
          ) / 10,
        usefulness:
          Math.round(
            (allReviews.reduce((sum, r) => sum + r.usefulnessRating, 0) / reviewCount) * 10
          ) / 10,
        overall:
          Math.round(
            (allReviews.reduce((sum, r) => sum + r.overallRating, 0) / reviewCount) * 10
          ) / 10,
        recommendPercent:
          totalRecommendResponses > 0
            ? Math.round((recommendCount / totalRecommendResponses) * 100)
            : 0,
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

    const reviews = await prisma.courseReview.findMany({
      where: { courseId: course.id },
      select: {
        id: true,
        semester: true,
        difficultyRating: true,
        workloadRating: true,
        usefulnessRating: true,
        overallRating: true,
        wouldRecommend: true,
        grade: true,
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
        professor: {
          select: {
            id: true,
            name: true,
            title: true,
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
      difficultyRating: review.difficultyRating,
      workloadRating: review.workloadRating,
      usefulnessRating: review.usefulnessRating,
      overallRating: review.overallRating,
      wouldRecommend: review.wouldRecommend,
      grade: review.grade,
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
      professor: review.professor,
    }));

    const professorIds = course.professors.map((cp) => cp.professor.id);
    const professorRatings =
      professorIds.length > 0
        ? await prisma.professorReview.groupBy({
            by: ["professorId"],
            where: { professorId: { in: professorIds } },
            _avg: { overallRating: true },
            _count: { _all: true },
          })
        : [];

    const ratingMap = new Map(
      professorRatings.map((row) => [
        row.professorId,
        {
          rating: row._avg.overallRating ? Math.round(row._avg.overallRating * 10) / 10 : 0,
          reviewCount: row._count._all,
        },
      ])
    );

    const professorsWithStats = course.professors.map((cp) => {
      const rating = ratingMap.get(cp.professor.id);
      return {
        ...cp.professor,
        rating: rating?.rating ?? 0,
        reviewCount: rating?.reviewCount ?? 0,
      };
    });

    return NextResponse.json({
      course: {
        id: course.id,
        code: course.code,
        name: course.name,
        credits: course.credits,
        description: course.description,
        courseType: course.courseType,
        department: course.department,
      },
      stats: {
        ...stats,
        reviewCount,
      },
      gradeDistribution,
      professors: professorsWithStats,
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
    console.error("Course detail GET error:", error);
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "Ders bilgileri yüklenirken bir hata oluştu",
      {
        endpoint: "/api/courses/[code]",
      }
    );
  }
}
