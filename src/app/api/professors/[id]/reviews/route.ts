import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { errorResponse } from "@/lib/api-response";

const professorReviewSchema = z.object({
  courseId: z.string().min(1, "Ders seçimi zorunludur"),
  semester: z.string().min(1, "Dönem seçimi zorunludur"),
  teachingRating: z.number().int().min(1).max(5, "Anlatım puanı 1-5 arasında olmalıdır"),
  gradingRating: z.number().int().min(1).max(5, "Notlandırma puanı 1-5 arasında olmalıdır"),
  accessRating: z.number().int().min(1).max(5, "Ulaşılabilirlik puanı 1-5 arasında olmalıdır"),
  overallRating: z.number().int().min(1).max(5, "Genel puan 1-5 arasında olmalıdır"),
  wouldTakeAgain: z.boolean(),
  comment: z
    .string()
    .min(15, "Yorum en az 15 karakter olmalıdır")
    .max(2000, "Yorum en fazla 2000 karakter olabilir"),
  isAnonymous: z.boolean().default(true),
});

// POST /api/professors/[id]/reviews - Yeni değerlendirme oluştur
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return errorResponse(401, "UNAUTHORIZED", "Değerlendirme yapmak için giriş yapmalısınız", {
        endpoint: "/api/professors/[id]/reviews",
      });
    }


    const { id } = await params;
    if (!id?.trim()) {
      return errorResponse(400, "BAD_REQUEST", "Hoca id zorunludur", {
        endpoint: "/api/professors/[id]/reviews",
      });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse(400, "BAD_REQUEST", "Geçersiz JSON body", {
        endpoint: "/api/professors/[id]/reviews",
      });
    }

    const validationResult = professorReviewSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((e) => e.message).join(", ");
      const fieldErrors = validationResult.error.issues.reduce<Record<string, string>>((acc, issue) => {
        const field = issue.path[0];
        if (typeof field === "string" && !acc[field]) {
          acc[field] = issue.message;
        }
        return acc;
      }, {});

      return errorResponse(400, "VALIDATION_ERROR", errors, {
        endpoint: "/api/professors/[id]/reviews",
        fieldErrors,
      });
    }

    const data = validationResult.data;

    const professor = await prisma.professor.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!professor) {
      return errorResponse(404, "NOT_FOUND", "Hoca bulunamadı", {
        endpoint: "/api/professors/[id]/reviews",
        id,
      });
    }

    const course = await prisma.course.findUnique({
      where: { id: data.courseId },
      select: { id: true },
    });

    if (!course) {
      return errorResponse(404, "NOT_FOUND", "Ders bulunamadı", {
        endpoint: "/api/professors/[id]/reviews",
        courseId: data.courseId,
      });
    }

    const existingReview = await prisma.professorReview.findUnique({
      where: {
        userId_professorId_semester: {
          userId: session.user.id,
          professorId: id,
          semester: data.semester,
        },
      },
      select: { id: true },
    });

    if (existingReview) {
      return errorResponse(
        409,
        "CONFLICT",
        "Bu hoca için bu dönemde zaten bir değerlendirme yapmışsınız",
        {
          endpoint: "/api/professors/[id]/reviews",
          professorId: id,
          semester: data.semester,
        }
      );
    }

    const review = await prisma.professorReview.create({
      data: {
        userId: session.user.id,
        professorId: id,
        courseId: data.courseId,
        semester: data.semester,
        teachingRating: data.teachingRating,
        gradingRating: data.gradingRating,
        accessRating: data.accessRating,
        overallRating: data.overallRating,
        wouldTakeAgain: data.wouldTakeAgain,
        comment: data.comment,
        isAnonymous: data.isAnonymous,
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
        createdAt: true,
        course: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Değerlendirmeniz başarıyla kaydedildi",
        review: {
          id: review.id,
          semester: review.semester,
          teachingRating: review.teachingRating,
          gradingRating: review.gradingRating,
          accessRating: review.accessRating,
          overallRating: review.overallRating,
          wouldTakeAgain: review.wouldTakeAgain,
          comment: review.comment,
          isAnonymous: review.isAnonymous,
          createdAt: review.createdAt.toISOString(),
          course: review.course,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Professor review POST error:", error);
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "Değerlendirme kaydedilirken bir hata oluştu",
      {
        endpoint: "/api/professors/[id]/reviews",
      }
    );
  }
}
