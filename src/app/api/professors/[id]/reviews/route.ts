import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

// Validation schema
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
    .min(50, "Yorum en az 50 karakter olmalıdır")
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
      return NextResponse.json(
        { error: "Değerlendirme yapmak için giriş yapmalısınız" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Validation
    const validationResult = professorReviewSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((e) => e.message).join(", ");
      return NextResponse.json(
        { error: errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Hocayı kontrol et
    const professor = await prisma.professor.findUnique({
      where: { id },
    });

    if (!professor) {
      return NextResponse.json(
        { error: "Hoca bulunamadı" },
        { status: 404 }
      );
    }

    // Dersi kontrol et
    const course = await prisma.course.findUnique({
      where: { id: data.courseId },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Ders bulunamadı" },
        { status: 404 }
      );
    }

    // Aynı kullanıcı + aynı hoca + aynı dönem kontrolü
    const existingReview = await prisma.professorReview.findUnique({
      where: {
        userId_professorId_semester: {
          userId: session.user.id,
          professorId: id,
          semester: data.semester,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "Bu hoca için bu dönemde zaten bir değerlendirme yapmışsınız" },
        { status: 400 }
      );
    }

    // Değerlendirme oluştur
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
      include: {
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
    return NextResponse.json(
      { error: "Değerlendirme kaydedilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
