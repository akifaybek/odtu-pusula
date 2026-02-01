import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/courses/[code] - Ders detay
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const { searchParams } = new URL(request.url);

    // Pagination for reviews
    const reviewsPage = parseInt(searchParams.get("reviewsPage") || "1");
    const reviewsLimit = parseInt(searchParams.get("reviewsLimit") || "10");
    const reviewsSkip = (reviewsPage - 1) * reviewsLimit;
    const sortBy = searchParams.get("sortBy") || "newest"; // newest, oldest, most-liked, highest-rating, lowest-rating

    // Ders kodunu normalize et (CENG-331 -> CENG331)
    const normalizedCode = code.replace(/-/g, "").toUpperCase();

    // Dersi bul
    const course = await prisma.course.findFirst({
      where: {
        OR: [
          { code: normalizedCode },
          { code: code.toUpperCase() },
          { code: { contains: normalizedCode, mode: "insensitive" } },
        ],
      },
      include: {
        department: {
          select: {
            id: true,
            code: true,
            name: true,
            faculty: true,
          },
        },
        professors: {
          include: {
            professor: {
              select: {
                id: true,
                name: true,
                title: true,
              },
            },
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Ders bulunamadı" },
        { status: 404 }
      );
    }

    // Tüm reviews için istatistik hesapla
    const allReviews = await prisma.courseReview.findMany({
      where: { courseId: course.id },
      select: {
        difficultyRating: true,
        workloadRating: true,
        usefulnessRating: true,
        overallRating: true,
      },
    });

    const reviewCount = allReviews.length;
    let stats = {
      difficulty: 0,
      workload: 0,
      usefulness: 0,
      overall: 0,
    };

    if (reviewCount > 0) {
      stats = {
        difficulty: Math.round((allReviews.reduce((sum, r) => sum + r.difficultyRating, 0) / reviewCount) * 10) / 10,
        workload: Math.round((allReviews.reduce((sum, r) => sum + r.workloadRating, 0) / reviewCount) * 10) / 10,
        usefulness: Math.round((allReviews.reduce((sum, r) => sum + r.usefulnessRating, 0) / reviewCount) * 10) / 10,
        overall: Math.round((allReviews.reduce((sum, r) => sum + r.overallRating, 0) / reviewCount) * 10) / 10,
      };
    }

    // Sıralama için orderBy
    let orderBy: object = { createdAt: "desc" };
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
    }

    // Paginated reviews
    const reviews = await prisma.courseReview.findMany({
      where: { courseId: course.id },
      include: {
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

    // Reviews'u formatla (anonim kullanıcı bilgilerini gizle)
    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      semester: review.semester,
      difficultyRating: review.difficultyRating,
      workloadRating: review.workloadRating,
      usefulnessRating: review.usefulnessRating,
      overallRating: review.overallRating,
      grade: review.grade,
      comment: review.comment,
      isAnonymous: review.isAnonymous,
      likes: review.likes,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
      user: review.isAnonymous
        ? null
        : {
            id: review.user.id,
            name: review.user.name,
          },
      professor: review.professor,
    }));

    // Hocaların rating'lerini hesapla
    const professorsWithStats = await Promise.all(
      course.professors.map(async (cp) => {
        const profReviews = await prisma.professorReview.findMany({
          where: { professorId: cp.professor.id },
          select: { overallRating: true },
        });

        const profReviewCount = profReviews.length;
        const avgRating = profReviewCount > 0
          ? Math.round((profReviews.reduce((sum, r) => sum + r.overallRating, 0) / profReviewCount) * 10) / 10
          : 0;

        return {
          ...cp.professor,
          rating: avgRating,
          reviewCount: profReviewCount,
        };
      })
    );

    return NextResponse.json({
      course: {
        id: course.id,
        code: course.code,
        name: course.name,
        credits: course.credits,
        description: course.description,
        department: course.department,
      },
      stats: {
        ...stats,
        reviewCount,
      },
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
    return NextResponse.json(
      { error: "Ders bilgileri yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
