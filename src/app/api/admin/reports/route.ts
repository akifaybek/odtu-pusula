import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { sendAdminNotification, getAdminEmails } from "@/lib/email";

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const reports = await prisma.report.findMany({
      where: status && status !== "all"
        ? { status: status as "PENDING" | "RESOLVED" | "DISMISSED" }
        : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        reporter: {
          select: { id: true, name: true, email: true },
        },
        courseReview: {
          include: {
            user: { select: { name: true, email: true } },
            course: { select: { code: true, name: true } },
          },
        },
        professorReview: {
          include: {
            user: { select: { name: true, email: true } },
            professor: { select: { name: true } },
          },
        },
        handler: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Admin reports error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;

    const { reportId, action, adminNote } = await request.json();

    if (!reportId || !action) {
      return NextResponse.json({ error: "Eksik parametreler" }, { status: 400 });
    }

    // Raporu ve ilişkili içerikleri getir
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        courseReview: true,
        professorReview: true,
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Rapor bulunamadı" }, { status: 404 });
    }

    const newStatus = action === "resolve" ? "RESOLVED" : "DISMISSED";

    // Transaction başlat - hem raporu güncelle hem de içeriği
    await prisma.$transaction(async (tx) => {
      // 1. Raporu güncelle
      await tx.report.update({
        where: { id: reportId },
        data: {
          status: newStatus,
          handledBy: session.user.id,
          handledAt: new Date(),
          adminNote: adminNote || null,
        },
      });

      // 2. Eğer çözüldüyse ve içerik varsa, içeriği REJECTED yap
      if (action === "resolve") {
        if (report.courseReviewId) {
          await tx.courseReview.update({
            where: { id: report.courseReviewId },
            data: { status: "REJECTED" },
          });
        }
        if (report.professorReviewId) {
          await tx.professorReview.update({
            where: { id: report.professorReviewId },
            data: { status: "REJECTED" },
          });
        }
      }
    });

    // Send notification to admins about report resolution
    try {
      const adminEmails = await getAdminEmails();
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

      if (adminEmails.length > 0) {
        await sendAdminNotification({
          adminEmails,
          subject: `Rapor ${action === "resolve" ? "Çözüldü" : "Reddedildi"}`,
          title: `Rapor İşlendi`,
          message: `
            Rapor ID: ${reportId}<br>
            İşlem: ${action === "resolve" ? "Çözüldü (İçerik kaldırıldı)" : "Reddedildi"}<br>
            İşleyen: ${session.user.name || session.user.email}<br>
            ${adminNote ? `Not: ${adminNote}` : ""}
          `,
          actionUrl: `${appUrl}/admin/reports`,
          actionText: "Raporları Görüntüle",
        });
      }
    } catch (notificationError) {
      // Don't fail the request if notification fails
      console.error("Admin notification failed:", notificationError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin report action error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
