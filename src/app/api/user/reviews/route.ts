import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: Kullanıcının değerlendirmeleri
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "course" | "professor" | null (all)

    const courseReviews =
      type === "professor"
        ? []
        : await prisma.courseReview.findMany({
            where: { userId: session.user.id },
            include: {
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
            include: {
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

    return NextResponse.json({
      courseReviews: courseReviews.map((r) => ({
        ...r,
        type: "course" as const,
      })),
      professorReviews: professorReviews.map((r) => ({
        ...r,
        type: "professor" as const,
      })),
    });
  } catch (error) {
    console.error("User reviews GET error:", error);
    return NextResponse.json(
      { error: "Değerlendirmeler yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}
