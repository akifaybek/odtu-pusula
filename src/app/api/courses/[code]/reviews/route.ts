import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { Grade } from "@prisma/client";

// Validation schema
const courseReviewSchema = z.object({
  professorId: z.string().min(1, "Hoca seçimi zorunludur"),
  semester: z.string().min(1, "Dönem seçimi zorunludur"),
  difficultyRating: z.number().int().min(1).max(5, "Zorluk puanı 1-5 arasında olmalıdır"),
  workloadRating: z.number().int().min(1).max(5, "İş yükü puanı 1-5 arasında olmalıdır"),
  usefulnessRating: z.number().int().min(1).max(5, "Fayda puanı 1-5 arasında olmalıdır"),
  overallRating: z.number().int().min(1).max(5, "Genel puan 1-5 arasında olmalıdır"),
  grade: z.enum(["AA", "BA", "BB", "CB", "CC", "DC", "DD", "FD", "FF", "NA"]).optional().nullable(),
  comment: z
    .string()
    .min(50, "Yorum en az 50 karakter olmalıdır")
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
      return NextResponse.json(
        { error: "Değerlendirme yapmak için giriş yapmalısınız" },
        { status: 401 }
      );
    }

    const { code } = await params;
    const body = await request.json();

    // Validation
    const validationResult = courseReviewSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((e) => e.message).join(", ");
      return NextResponse.json(
        { error: errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Ders kodunu normalize et
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
    });

    if (!course) {
      return NextResponse.json(
        { error: "Ders bulunamadı" },
        { status: 404 }
      );
    }

    // Hocayı kontrol et
    const professor = await prisma.professor.findUnique({
      where: { id: data.professorId },
    });

    if (!professor) {
      return NextResponse.json(
        { error: "Hoca bulunamadı" },
        { status: 404 }
      );
    }

    // Aynı kullanıcı + aynı ders + aynı dönem kontrolü
    const existingReview = await prisma.courseReview.findUnique({
      where: {
        userId_courseId_semester: {
          userId: session.user.id,
          courseId: course.id,
          semester: data.semester,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "Bu ders için bu dönemde zaten bir değerlendirme yapmışsınız" },
        { status: 400 }
      );
    }

    // Değerlendirme oluştur
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
        grade: data.grade ? (data.grade as Grade) : null,
        comment: data.comment,
        isAnonymous: data.isAnonymous,
      },
      include: {
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
    return NextResponse.json(
      { error: "Değerlendirme kaydedilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
