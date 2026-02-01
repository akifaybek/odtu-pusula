import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Title } from "@prisma/client";

// Türkçe unvan mapping
const titleMap: Record<Title, string> = {
  PROF_DR: "Prof. Dr.",
  ASSOC_PROF_DR: "Doç. Dr.",
  ASST_PROF_DR: "Dr. Öğr. Üyesi",
  LECTURER: "Öğr. Gör.",
  RES_ASST: "Arş. Gör.",
};

// GET /api/professors/[id] - Hoca detay
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    // Pagination for reviews
    const reviewsPage = parseInt(searchParams.get("reviewsPage") || "1");
    const reviewsLimit = parseInt(searchParams.get("reviewsLimit") || "10");
    const reviewsSkip = (reviewsPage - 1) * reviewsLimit;
    const sortBy = searchParams.get("sortBy") || "newest";

    // Hocayı bul
    const professor = await prisma.professor.findUnique({
      where: { id },
      include: {
        department: {
          select: {
            id: true,
            code: true,
            name: true,
            faculty: true,
          },
        },
        courses: {
          include: {
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
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    if (!professor) {
      return NextResponse.json(
        { error: "Hoca bulunamadı" },
        { status: 404 }
      );
    }

    // Tüm reviews için istatistik hesapla
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
        teaching: Math.round((allReviews.reduce((sum, r) => sum + r.teachingRating, 0) / reviewCount) * 10) / 10,
        grading: Math.round((allReviews.reduce((sum, r) => sum + r.gradingRating, 0) / reviewCount) * 10) / 10,
        accessibility: Math.round((allReviews.reduce((sum, r) => sum + r.accessRating, 0) / reviewCount) * 10) / 10,
        overall: Math.round((allReviews.reduce((sum, r) => sum + r.overallRating, 0) / reviewCount) * 10) / 10,
        wouldTakeAgainPercent: Math.round((allReviews.filter((r) => r.wouldTakeAgain).length / reviewCount) * 100),
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
    const reviews = await prisma.professorReview.findMany({
      where: { professorId: id },
      include: {
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

    // Reviews'u formatla
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
      user: review.isAnonymous
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
    return NextResponse.json(
      { error: "Hoca bilgileri yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
