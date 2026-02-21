import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { errorResponse } from "@/lib/api-response";
import {
  classifyError,
  classifyThrownError,
  completeRequestTrace,
  startRequestTrace,
} from "@/lib/observability";

// GET: Kullanıcının değerlendirmeleri
export async function GET(request: NextRequest) {
  const trace = startRequestTrace(request, "/api/user/reviews");

  const fail = (status: number, code: "BAD_REQUEST" | "UNAUTHORIZED" | "INTERNAL_ERROR", message: string, context?: Record<string, unknown>) =>
    completeRequestTrace(trace, errorResponse(status, code, message, context), {
      errorClass: classifyError(status),
    });

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return fail(401, "UNAUTHORIZED", "Oturum açmanız gerekiyor", {
        endpoint: "/api/user/reviews",
      });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (type && type !== "course" && type !== "professor") {
      return fail(400, "BAD_REQUEST", "Geçersiz değerlendirme tipi filtresi", {
        endpoint: "/api/user/reviews",
        type,
      });
    }

    const courseReviews =
      type === "professor"
        ? []
        : await prisma.courseReview.findMany({
            where: { userId: session.user.id },
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
              course: {
                select: {
                  id: true,
                  code: true,
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
            orderBy: { createdAt: "desc" },
          });

    const professorReviews =
      type === "course"
        ? []
        : await prisma.professorReview.findMany({
            where: { userId: session.user.id },
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
              professor: {
                select: {
                  id: true,
                  name: true,
                  title: true,
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
            orderBy: { createdAt: "desc" },
          });

    return completeRequestTrace(
      trace,
      NextResponse.json({
        courseReviews: courseReviews.map((r) => ({
          ...r,
          type: "course" as const,
        })),
        professorReviews: professorReviews.map((r) => ({
          ...r,
          type: "professor" as const,
        })),
      })
    );
  } catch (error) {
    const response = errorResponse(500, "INTERNAL_ERROR", "Değerlendirmeler yüklenirken hata oluştu", {
      endpoint: "/api/user/reviews",
      requestId: trace.requestId,
      correlationId: trace.correlationId,
    });

    return completeRequestTrace(trace, response, {
      error,
      errorClass: classifyThrownError(error),
    });
  }
}
