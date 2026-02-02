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
    const type = searchParams.get("type");

    // Fetch both types of reviews
    const [courseReviews, professorReviews] = await Promise.all([
      type !== "professor"
        ? prisma.courseReview.findMany({
            where: status ? { status: status as "PENDING" | "APPROVED" | "REJECTED" } : undefined,
            orderBy: { createdAt: "desc" },
            include: {
              user: { select: { id: true, name: true, email: true } },
              course: { select: { code: true, name: true } },
              professor: { select: { name: true, title: true } },
              _count: { select: { reports: true } },
            },
          })
        : [],
      type !== "course"
        ? prisma.professorReview.findMany({
            where: status ? { status: status as "PENDING" | "APPROVED" | "REJECTED" } : undefined,
            orderBy: { createdAt: "desc" },
            include: {
              user: { select: { id: true, name: true, email: true } },
              professor: { select: { name: true, title: true } },
              course: { select: { code: true, name: true } },
              _count: { select: { reports: true } },
            },
          })
        : [],
    ]);

    // Transform to unified format
    const reviews = [
      ...courseReviews.map((r) => ({
        id: r.id,
        type: "course" as const,
        comment: r.comment,
        overallRating: r.overallRating,
        status: r.status,
        isAnonymous: r.isAnonymous,
        createdAt: r.createdAt.toISOString(),
        user: r.user,
        course: r.course,
        professor: r.professor,
        reportCount: r._count.reports,
      })),
      ...professorReviews.map((r) => ({
        id: r.id,
        type: "professor" as const,
        comment: r.comment,
        overallRating: r.overallRating,
        status: r.status,
        isAnonymous: r.isAnonymous,
        createdAt: r.createdAt.toISOString(),
        user: r.user,
        course: r.course,
        professor: r.professor,
        reportCount: r._count.reports,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Admin reviews error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const { reviewId, type, action } = await request.json();

    if (!reviewId || !type || !action) {
      return NextResponse.json({ error: "Eksik parametreler" }, { status: 400 });
    }

    const newStatus = action === "approve" ? "APPROVED" : "REJECTED";

    if (type === "course") {
      await prisma.courseReview.update({
        where: { id: reviewId },
        data: { status: newStatus },
      });
    } else {
      await prisma.professorReview.update({
        where: { id: reviewId },
        data: { status: newStatus },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin review action error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
