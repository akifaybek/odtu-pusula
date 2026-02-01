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

    // Tüm beğenileri getir
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

    return NextResponse.json({
      likes,
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
