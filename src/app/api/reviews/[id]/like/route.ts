import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { errorResponse } from "@/lib/api-response";
import {
  classifyError,
  classifyThrownError,
  completeRequestTrace,
  startRequestTrace,
} from "@/lib/observability";

const likeSchema = z.object({
  reviewType: z.enum(["course", "professor"]),
});

// POST /api/reviews/[id]/like - Toggle like
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const trace = startRequestTrace(request, "/api/reviews/[id]/like");

  const fail = (status: number, code: "BAD_REQUEST" | "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR" | "RATE_LIMITED" | "INTERNAL_ERROR", message: string, context?: Record<string, unknown>) =>
    completeRequestTrace(trace, errorResponse(status, code, message, context), {
      errorClass: classifyError(status),
    });

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return fail(401, "UNAUTHORIZED", "Beğenmek için giriş yapmalısınız", {
        endpoint: "/api/reviews/[id]/like",
      });
    }


    const { id: reviewId } = await params;
    if (!reviewId?.trim()) {
      return fail(400, "BAD_REQUEST", "Değerlendirme id zorunludur", {
        endpoint: "/api/reviews/[id]/like",
      });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return fail(400, "BAD_REQUEST", "Geçersiz JSON body", {
        endpoint: "/api/reviews/[id]/like",
        reviewId,
      });
    }

    const validationResult = likeSchema.safeParse(body);
    if (!validationResult.success) {
      return fail(400, "VALIDATION_ERROR", validationResult.error.issues[0].message, {
        endpoint: "/api/reviews/[id]/like",
        reviewId,
      });
    }

    const { reviewType } = validationResult.data;
    const userId = session.user.id;

    if (reviewType === "course") {
      const review = await prisma.courseReview.findUnique({
        where: { id: reviewId },
        select: { userId: true },
      });

      if (!review) {
        return fail(404, "NOT_FOUND", "Değerlendirme bulunamadı", {
          endpoint: "/api/reviews/[id]/like",
          reviewId,
          reviewType,
        });
      }

      if (review.userId === userId) {
        return fail(400, "BAD_REQUEST", "Kendi değerlendirmenizi beğenemezsiniz", {
          endpoint: "/api/reviews/[id]/like",
          reviewId,
          reviewType,
        });
      }
    } else {
      const review = await prisma.professorReview.findUnique({
        where: { id: reviewId },
        select: { userId: true },
      });

      if (!review) {
        return fail(404, "NOT_FOUND", "Değerlendirme bulunamadı", {
          endpoint: "/api/reviews/[id]/like",
          reviewId,
          reviewType,
        });
      }

      if (review.userId === userId) {
        return fail(400, "BAD_REQUEST", "Kendi değerlendirmenizi beğenemezsiniz", {
          endpoint: "/api/reviews/[id]/like",
          reviewId,
          reviewType,
        });
      }
    }

    const existingLike = await prisma.reviewLike.findUnique({
      where: {
        userId_reviewId_reviewType: {
          userId,
          reviewId,
          reviewType,
        },
      },
      select: { id: true },
    });

    let liked: boolean;
    let likeCount = 0;

    if (existingLike) {
      await prisma.$transaction(async (tx) => {
        await tx.reviewLike.delete({
          where: { id: existingLike.id },
        });

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
      await prisma.$transaction(async (tx) => {
        await tx.reviewLike.create({
          data: {
            userId,
            reviewId,
            reviewType,
          },
        });

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

    return completeRequestTrace(
      trace,
      NextResponse.json({
        liked,
        likeCount,
      })
    );
  } catch (error) {
    const response = errorResponse(500, "INTERNAL_ERROR", "Beğeni işlemi sırasında bir hata oluştu", {
      endpoint: "/api/reviews/[id]/like",
      requestId: trace.requestId,
      correlationId: trace.correlationId,
    });

    return completeRequestTrace(trace, response, {
      error,
      errorClass: classifyThrownError(error),
    });
  }
}
