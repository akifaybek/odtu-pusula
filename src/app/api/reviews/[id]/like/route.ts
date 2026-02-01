import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Validation schema
const likeSchema = z.object({
  reviewType: z.enum(["course", "professor"]),
});

// POST /api/reviews/[id]/like - Toggle like
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Beğenmek için giriş yapmalısınız" },
        { status: 401 }
      );
    }

    const { id: reviewId } = await params;
    const body = await request.json();

    // Validation
    const validationResult = likeSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { reviewType } = validationResult.data;
    const userId = session.user.id;

    // Review'un var olduğunu ve kullanıcının kendi review'u olmadığını kontrol et
    if (reviewType === "course") {
      const review = await prisma.courseReview.findUnique({
        where: { id: reviewId },
        select: { userId: true },
      });

      if (!review) {
        return NextResponse.json(
          { error: "Değerlendirme bulunamadı" },
          { status: 404 }
        );
      }

      if (review.userId === userId) {
        return NextResponse.json(
          { error: "Kendi değerlendirmenizi beğenemezsiniz" },
          { status: 400 }
        );
      }
    } else {
      const review = await prisma.professorReview.findUnique({
        where: { id: reviewId },
        select: { userId: true },
      });

      if (!review) {
        return NextResponse.json(
          { error: "Değerlendirme bulunamadı" },
          { status: 404 }
        );
      }

      if (review.userId === userId) {
        return NextResponse.json(
          { error: "Kendi değerlendirmenizi beğenemezsiniz" },
          { status: 400 }
        );
      }
    }

    // Mevcut like'ı kontrol et
    const existingLike = await prisma.reviewLike.findUnique({
      where: {
        userId_reviewId_reviewType: {
          userId,
          reviewId,
          reviewType,
        },
      },
    });

    let liked: boolean;
    let likeCount: number;

    if (existingLike) {
      // Unlike - like'ı kaldır
      await prisma.$transaction(async (tx) => {
        // Like'ı sil
        await tx.reviewLike.delete({
          where: { id: existingLike.id },
        });

        // Review'un like sayısını azalt
        if (reviewType === "course") {
          await tx.courseReview.update({
            where: { id: reviewId },
            data: { likes: { decrement: 1 } },
          });
        } else {
          await tx.professorReview.update({
            where: { id: reviewId },
            data: { likes: { decrement: 1 } },
          });
        }
      });

      liked = false;
    } else {
      // Like - yeni like ekle
      await prisma.$transaction(async (tx) => {
        // Like oluştur
        await tx.reviewLike.create({
          data: {
            userId,
            reviewId,
            reviewType,
          },
        });

        // Review'un like sayısını artır
        if (reviewType === "course") {
          await tx.courseReview.update({
            where: { id: reviewId },
            data: { likes: { increment: 1 } },
          });
        } else {
          await tx.professorReview.update({
            where: { id: reviewId },
            data: { likes: { increment: 1 } },
          });
        }
      });

      liked = true;
    }

    // Güncel like sayısını al
    if (reviewType === "course") {
      const review = await prisma.courseReview.findUnique({
        where: { id: reviewId },
        select: { likes: true },
      });
      likeCount = review?.likes || 0;
    } else {
      const review = await prisma.professorReview.findUnique({
        where: { id: reviewId },
        select: { likes: true },
      });
      likeCount = review?.likes || 0;
    }

    return NextResponse.json({
      liked,
      likeCount,
    });
  } catch (error) {
    console.error("Like POST error:", error);
    return NextResponse.json(
      { error: "Beğeni işlemi sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
}
