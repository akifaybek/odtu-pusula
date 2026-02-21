import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/user/likes - Kullanıcının beğendiği review'ları getir
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Giriş yapmalısınız" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reviewIds = searchParams.get("reviewIds"); // comma-separated review IDs
    const reviewType = searchParams.get("reviewType"); // "course" or "professor" or "all"

    // Eğer belirli review ID'leri verilmişse, sadece onları kontrol et
    if (reviewIds) {
      const ids = reviewIds.split(",").filter(Boolean);

      const likes = await prisma.reviewLike.findMany({
        where: {
          userId: session.user.id,
          reviewId: { in: ids },
          ...(reviewType && reviewType !== "all" ? { reviewType } : {}),
        },
        select: {
          reviewId: true,
          reviewType: true,
        },
      });

      // Review ID'lerini liked set olarak dön
      const likedReviewIds = likes.map((like) => like.reviewId);

      return NextResponse.json({
        likedReviewIds,
      });
    }

    // Tüm beğenileri detaylı getir
    const where: { userId: string; reviewType?: string } = {
      userId: session.user.id,
    };

    if (reviewType && reviewType !== "all") {
      where.reviewType = reviewType;
    }

    const likes = await prisma.reviewLike.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Beğenilen course review'ları getir
    const courseLikeIds = likes
      .filter((l) => l.reviewType === "course")
      .map((l) => l.reviewId);

    const likedCourseReviews = await prisma.courseReview.findMany({
      where: { id: { in: courseLikeIds } },
      include: {
        course: { select: { id: true, code: true, name: true } },
        professor: { select: { id: true, name: true, title: true } },
      },
    });

    // Beğenilen professor review'ları getir
    const professorLikeIds = likes
      .filter((l) => l.reviewType === "professor")
      .map((l) => l.reviewId);

    const likedProfessorReviews = await prisma.professorReview.findMany({
      where: { id: { in: professorLikeIds } },
      include: {
        professor: { select: { id: true, name: true, title: true } },
        course: { select: { id: true, code: true, name: true } },
      },
    });

    return NextResponse.json({
      likes,
      likedCourseReviews: likedCourseReviews.map((r) => ({
        ...r,
        type: "course",
        likedAt: likes.find((l) => l.reviewId === r.id)?.createdAt,
      })),
      likedProfessorReviews: likedProfessorReviews.map((r) => ({
        ...r,
        type: "professor",
        likedAt: likes.find((l) => l.reviewId === r.id)?.createdAt,
      })),
      total: likes.length,
    });
  } catch (error) {
    console.error("User likes GET error:", error);
    return NextResponse.json(
      { error: "Beğeniler yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
