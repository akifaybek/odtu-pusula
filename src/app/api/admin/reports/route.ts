import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

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
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const { reportId, action, adminNote } = await request.json();

    if (!reportId || !action) {
      return NextResponse.json({ error: "Eksik parametreler" }, { status: 400 });
    }

    const newStatus = action === "resolve" ? "RESOLVED" : "DISMISSED";

    await prisma.report.update({
      where: { id: reportId },
      data: {
        status: newStatus,
        handledBy: session.user.id,
        handledAt: new Date(),
        adminNote: adminNote || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin report action error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
