import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const reportSchema = z.object({
  reviewId: z.string(),
  reviewType: z.enum(["course", "professor"]),
  reason: z.enum(["spam", "hakaret", "yanlis_bilgi", "diger"]),
  description: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
    }

    const body = await request.json();
    const validationResult = reportSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Geçersiz veri", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { reviewId, reviewType, reason, description } = validationResult.data;

    // Check if review exists
    if (reviewType === "course") {
      const review = await prisma.courseReview.findUnique({
        where: { id: reviewId },
      });
      if (!review) {
        return NextResponse.json({ error: "Değerlendirme bulunamadı" }, { status: 404 });
      }

      // Check if already reported by this user
      const existingReport = await prisma.report.findFirst({
        where: {
          reporterId: session.user.id,
          courseReviewId: reviewId,
        },
      });
      if (existingReport) {
        return NextResponse.json({ error: "Bu değerlendirmeyi zaten raporladınız" }, { status: 400 });
      }

      await prisma.report.create({
        data: {
          reporterId: session.user.id,
          courseReviewId: reviewId,
          reason,
          description,
        },
      });
    } else {
      const review = await prisma.professorReview.findUnique({
        where: { id: reviewId },
      });
      if (!review) {
        return NextResponse.json({ error: "Değerlendirme bulunamadı" }, { status: 404 });
      }

      // Check if already reported by this user
      const existingReport = await prisma.report.findFirst({
        where: {
          reporterId: session.user.id,
          professorReviewId: reviewId,
        },
      });
      if (existingReport) {
        return NextResponse.json({ error: "Bu değerlendirmeyi zaten raporladınız" }, { status: 400 });
      }

      await prisma.report.create({
        data: {
          reporterId: session.user.id,
          professorReviewId: reviewId,
          reason,
          description,
        },
      });
    }

    return NextResponse.json({ success: true, message: "Rapor gönderildi" });
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
