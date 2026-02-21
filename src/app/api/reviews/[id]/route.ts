import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { errorResponse, type ApiErrorCode } from "@/lib/api-response";
import {
  classifyError,
  classifyThrownError,
  completeRequestTrace,
  startRequestTrace,
} from "@/lib/observability";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT: Değerlendirme güncelleme
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const trace = startRequestTrace(request, "/api/reviews/[id]");

  const fail = (
    status: number,
    errorCode: ApiErrorCode,
    message: string,
    context?: Record<string, unknown>
  ) =>
    completeRequestTrace(trace, errorResponse(status, errorCode, message, context), {
      errorClass: classifyError(status),
    });

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return fail(401, "UNAUTHORIZED", "Oturum açmanız gerekiyor", {
        endpoint: "/api/reviews/[id]",
      });
    }

    const { id } = await params;
    if (!id?.trim()) {
      return fail(400, "BAD_REQUEST", "Değerlendirme id zorunludur", {
        endpoint: "/api/reviews/[id]",
      });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return fail(400, "BAD_REQUEST", "Geçersiz JSON body", {
        endpoint: "/api/reviews/[id]",
        reviewId: id,
      });
    }

    const { type, ...updateData } = (body ?? {}) as Record<string, unknown>;

    if (!type || (type !== "course" && type !== "professor")) {
      return fail(400, "BAD_REQUEST", "Geçersiz değerlendirme tipi", {
        endpoint: "/api/reviews/[id]",
        reviewId: id,
      });
    }

    if (type === "course") {
      const review = await prisma.courseReview.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!review) {
        return fail(404, "NOT_FOUND", "Değerlendirme bulunamadı", {
          endpoint: "/api/reviews/[id]",
          type,
          reviewId: id,
        });
      }

      if (review.userId !== session.user.id) {
        return fail(403, "FORBIDDEN", "Bu değerlendirmeyi düzenleme yetkiniz yok", {
          endpoint: "/api/reviews/[id]",
          type,
          reviewId: id,
        });
      }

      const {
        difficultyRating,
        workloadRating,
        usefulnessRating,
        overallRating,
        comment,
        grade,
        isAnonymous,
      } = updateData;

      const updated = await prisma.courseReview.update({
        where: { id },
        data: {
          ...(difficultyRating !== undefined && { difficultyRating: difficultyRating as number }),
          ...(workloadRating !== undefined && { workloadRating: workloadRating as number }),
          ...(usefulnessRating !== undefined && { usefulnessRating: usefulnessRating as number }),
          ...(overallRating !== undefined && { overallRating: overallRating as number }),
          ...(comment !== undefined && { comment: comment as string }),
          ...(grade !== undefined && { grade: grade as never }),
          ...(isAnonymous !== undefined && { isAnonymous: isAnonymous as boolean }),
        },
        select: {
          id: true,
          semester: true,
          difficultyRating: true,
          workloadRating: true,
          usefulnessRating: true,
          overallRating: true,
          comment: true,
          grade: true,
          isAnonymous: true,
          likes: true,
          createdAt: true,
          updatedAt: true,
          course: { select: { code: true, name: true } },
          professor: { select: { name: true, title: true } },
        },
      });

      return completeRequestTrace(trace, NextResponse.json(updated));
    }

    const review = await prisma.professorReview.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!review) {
      return fail(404, "NOT_FOUND", "Değerlendirme bulunamadı", {
        endpoint: "/api/reviews/[id]",
        type,
        reviewId: id,
      });
    }

    if (review.userId !== session.user.id) {
      return fail(403, "FORBIDDEN", "Bu değerlendirmeyi düzenleme yetkiniz yok", {
        endpoint: "/api/reviews/[id]",
        type,
        reviewId: id,
      });
    }

    const {
      teachingRating,
      gradingRating,
      accessRating,
      overallRating,
      comment,
      wouldTakeAgain,
      isAnonymous,
    } = updateData;

    const updated = await prisma.professorReview.update({
      where: { id },
      data: {
        ...(teachingRating !== undefined && { teachingRating: teachingRating as number }),
        ...(gradingRating !== undefined && { gradingRating: gradingRating as number }),
        ...(accessRating !== undefined && { accessRating: accessRating as number }),
        ...(overallRating !== undefined && { overallRating: overallRating as number }),
        ...(comment !== undefined && { comment: comment as string }),
        ...(wouldTakeAgain !== undefined && { wouldTakeAgain: wouldTakeAgain as boolean }),
        ...(isAnonymous !== undefined && { isAnonymous: isAnonymous as boolean }),
      },
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
        professor: { select: { name: true, title: true } },
        course: { select: { code: true, name: true } },
      },
    });

    return completeRequestTrace(trace, NextResponse.json(updated));
  } catch (error) {
    const response = errorResponse(500, "INTERNAL_ERROR", "Değerlendirme güncellenirken hata oluştu", {
      endpoint: "/api/reviews/[id]",
      requestId: trace.requestId,
      correlationId: trace.correlationId,
    });

    return completeRequestTrace(trace, response, {
      error,
      errorClass: classifyThrownError(error),
    });
  }
}

// DELETE: Değerlendirme silme
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const trace = startRequestTrace(request, "/api/reviews/[id]");

  const fail = (
    status: number,
    errorCode: ApiErrorCode,
    message: string,
    context?: Record<string, unknown>
  ) =>
    completeRequestTrace(trace, errorResponse(status, errorCode, message, context), {
      errorClass: classifyError(status),
    });

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return fail(401, "UNAUTHORIZED", "Oturum açmanız gerekiyor", {
        endpoint: "/api/reviews/[id]",
      });
    }

    const { id } = await params;
    if (!id?.trim()) {
      return fail(400, "BAD_REQUEST", "Değerlendirme id zorunludur", {
        endpoint: "/api/reviews/[id]",
      });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (!type || (type !== "course" && type !== "professor")) {
      return fail(400, "BAD_REQUEST", "Geçersiz değerlendirme tipi", {
        endpoint: "/api/reviews/[id]",
        reviewId: id,
      });
    }

    if (type === "course") {
      const review = await prisma.courseReview.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!review) {
        return fail(404, "NOT_FOUND", "Değerlendirme bulunamadı", {
          endpoint: "/api/reviews/[id]",
          type,
          reviewId: id,
        });
      }

      if (review.userId !== session.user.id) {
        return fail(403, "FORBIDDEN", "Bu değerlendirmeyi silme yetkiniz yok", {
          endpoint: "/api/reviews/[id]",
          type,
          reviewId: id,
        });
      }

      await prisma.courseReview.delete({ where: { id } });
    } else {
      const review = await prisma.professorReview.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!review) {
        return fail(404, "NOT_FOUND", "Değerlendirme bulunamadı", {
          endpoint: "/api/reviews/[id]",
          type,
          reviewId: id,
        });
      }

      if (review.userId !== session.user.id) {
        return fail(403, "FORBIDDEN", "Bu değerlendirmeyi silme yetkiniz yok", {
          endpoint: "/api/reviews/[id]",
          type,
          reviewId: id,
        });
      }

      await prisma.professorReview.delete({ where: { id } });
    }

    return completeRequestTrace(trace, NextResponse.json({ message: "Değerlendirme silindi" }));
  } catch (error) {
    const response = errorResponse(500, "INTERNAL_ERROR", "Değerlendirme silinirken hata oluştu", {
      endpoint: "/api/reviews/[id]",
      requestId: trace.requestId,
      correlationId: trace.correlationId,
    });

    return completeRequestTrace(trace, response, {
      error,
      errorClass: classifyThrownError(error),
    });
  }
}
