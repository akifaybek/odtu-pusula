import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { sendAdminNotification, getAdminEmails } from "@/lib/email";

const reasonLabels: Record<string, string> = {
  spam: "Spam",
  hakaret: "Hakaret/Küfür",
  yanlis_bilgi: "Yanlış Bilgi",
  diger: "Diğer",
};

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

    // Send notification to admins about new report
    try {
      const adminEmails = await getAdminEmails();
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

      if (adminEmails.length > 0) {
        await sendAdminNotification({
          adminEmails,
          subject: "Yeni İçerik Raporu",
          title: "Yeni Bir İçerik Raporlandı",
          message: `
            Tür: ${reviewType === "course" ? "Ders Değerlendirmesi" : "Hoca Değerlendirmesi"}<br>
            Sebep: ${reasonLabels[reason] || reason}<br>
            ${description ? `Açıklama: ${description}` : ""}
          `,
          actionUrl: `${appUrl}/admin/reports`,
          actionText: "Raporları İncele",
        });
      }
    } catch (notificationError) {
      // Don't fail the request if notification fails
      console.error("Admin notification failed:", notificationError);
    }

    return NextResponse.json({ success: true, message: "Rapor gönderildi" });
  } catch (error) {
    console.error("Report error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
