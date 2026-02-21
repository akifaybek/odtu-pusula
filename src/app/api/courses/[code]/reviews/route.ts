import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { Grade } from "@prisma/client";
import { errorResponse } from "@/lib/api-response";

const courseReviewSchema = z.object({
  professorId: z.string().min(1, "Hoca seçimi zorunludur"),
  semester: z.string().min(1, "Dönem seçimi zorunludur"),
  difficultyRating: z.number().int().min(1).max(5, "Zorluk puanı 1-5 arasında olmalıdır"),
  workloadRating: z.number().int().min(1).max(5, "İş yükü puanı 1-5 arasında olmalıdır"),
  usefulnessRating: z.number().int().min(1).max(5, "Fayda puanı 1-5 arasında olmalıdır"),
  overallRating: z.number().int().min(1).max(5, "Genel puan 1-5 arasında olmalıdır"),
  wouldRecommend: z.boolean().optional().nullable(),
  grade: z.enum(["AA", "BA", "BB", "CB", "CC", "DC", "DD", "FD", "FF", "NA"]).optional().nullable(),
  comment: z
    .string()
    .min(15, "Yorum en az 15 karakter olmalıdır")
    .max(2000, "Yorum en fazla 2000 karakter olabilir"),
  isAnonymous: z.boolean().default(true),
});

// POST /api/courses/[code]/reviews - Yeni değerlendirme oluştur
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return errorResponse(401, "UNAUTHORIZED", "Değerlendirme yapmak için giriş yapmalısınız", {
        endpoint: "/api/courses/[code]/reviews",
      });
    }


    const { code } = await params;
    if (!code?.trim()) {
      return errorResponse(400, "BAD_REQUEST", "Ders kodu zorunludur", {
        endpoint: "/api/courses/[code]/reviews",
      });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse(400, "BAD_REQUEST", "Geçersiz JSON body", {
        endpoint: "/api/courses/[code]/reviews",
      });
    }

    const validationResult = courseReviewSchema.safeParse(body);

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
        endpoint: "/api/courses/[code]/reviews",
        fieldErrors,
      });
    }

    const data = validationResult.data;
    const normalizedCode = code.replace(/-/g, "").toUpperCase();

    const course = await prisma.course.findFirst({
      where: {
        OR: [
          { code: normalizedCode },
          { code: code.toUpperCase() },
          { code: { contains: normalizedCode, mode: "insensitive" } },
        ],
      },
      select: { id: true },
    });

    if (!course) {
      return errorResponse(404, "NOT_FOUND", "Ders bulunamadı", {
        endpoint: "/api/courses/[code]/reviews",
        code,
      });
    }

    const professor = await prisma.professor.findUnique({
      where: { id: data.professorId },
      select: { id: true },
    });

    if (!professor) {
      return errorResponse(404, "NOT_FOUND", "Hoca bulunamadı", {
        endpoint: "/api/courses/[code]/reviews",
        professorId: data.professorId,
      });
    }

    const existingReview = await prisma.courseReview.findUnique({
      where: {
        userId_courseId_semester: {
          userId: session.user.id,
          courseId: course.id,
          semester: data.semester,
        },
      },
      select: { id: true },
    });

    if (existingReview) {
      return errorResponse(
        409,
        "CONFLICT",
        "Bu ders için bu dönemde zaten bir değerlendirme yapmışsınız",
        {
          endpoint: "/api/courses/[code]/reviews",
          courseId: course.id,
          semester: data.semester,
        }
      );
    }

    const review = await prisma.courseReview.create({
      data: {
        userId: session.user.id,
        courseId: course.id,
        professorId: data.professorId,
        semester: data.semester,
        difficultyRating: data.difficultyRating,
        workloadRating: data.workloadRating,
        usefulnessRating: data.usefulnessRating,
        overallRating: data.overallRating,
        wouldRecommend: data.wouldRecommend ?? null,
        grade: data.grade ? (data.grade as Grade) : null,
        comment: data.comment,
        isAnonymous: data.isAnonymous,
      },
      select: {
        id: true,
        semester: true,
        difficultyRating: true,
        workloadRating: true,
        usefulnessRating: true,
        overallRating: true,
        grade: true,
        comment: true,
        isAnonymous: true,
        createdAt: true,
        professor: {
          select: {
            id: true,
            name: true,
            title: true,
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
          difficultyRating: review.difficultyRating,
          workloadRating: review.workloadRating,
          usefulnessRating: review.usefulnessRating,
          overallRating: review.overallRating,
          grade: review.grade,
          comment: review.comment,
          isAnonymous: review.isAnonymous,
          createdAt: review.createdAt.toISOString(),
          professor: review.professor,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Course review POST error:", error);
    return errorResponse(
      500,
      "INTERNAL_ERROR",
      "Değerlendirme kaydedilirken bir hata oluştu",
      {
        endpoint: "/api/courses/[code]/reviews",
      }
    );
  }
}
