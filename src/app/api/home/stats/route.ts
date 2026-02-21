import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Title enum to Turkish mapping
const titleMap: Record<string, string> = {
  PROF_DR: "Prof. Dr.",
  ASSOC_PROF_DR: "Doç. Dr.",
  ASST_PROF_DR: "Dr. Öğr. Üyesi",
  LECTURER: "Öğr. Gör.",
  RES_ASST: "Arş. Gör.",
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Az önce";
  if (minutes < 60) return `${minutes} dakika önce`;
  if (hours < 24) return `${hours} saat önce`;
  if (days === 1) return "1 gün önce";
  return `${days} gün önce`;
}

export async function GET() {
  try {
    const [
      totalCourses,
      totalProfessors,
      totalCourseReviews,
      totalProfessorReviews,
      totalUsers,
      recentCourseReviews,
      recentProfessorReviews,
      topCourses,
      topProfessors,
    ] = await Promise.all([
      // Stats
      prisma.course.count(),
      prisma.professor.count(),
      prisma.courseReview.count({ where: { status: "APPROVED" } }),
      prisma.professorReview.count({ where: { status: "APPROVED" } }),
      prisma.user.count(),

      // Son 5 ders değerlendirmesi
      prisma.courseReview.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        where: { status: "APPROVED" },
        include: {
          course: { select: { code: true, name: true } },
          user: { select: { name: true } },
        },
      }),

      // Son 5 hoca değerlendirmesi
      prisma.professorReview.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        where: { status: "APPROVED" },
        include: {
          professor: { select: { name: true, title: true } },
          user: { select: { name: true } },
        },
      }),

      // En çok değerlendirilen 5 ders
      prisma.course.findMany({
        take: 5,
        orderBy: { reviews: { _count: "desc" } },
        select: {
          id: true,
          code: true,
          name: true,
          _count: { select: { reviews: true } },
        },
      }),

      // En yüksek puanlı 5 hoca (ortalama rating hesaplanarak)
      prisma.professor.findMany({
        take: 10,
        include: {
          reviews: {
            where: { status: "APPROVED" },
            select: { overallRating: true },
          },
          department: { select: { code: true } },
        },
      }),
    ]);

    // Calculate average ratings for professors and sort
    const professorsWithRatings = topProfessors
      .map((prof) => {
        const ratings = prof.reviews.map((r) => r.overallRating);
        const avgRating =
          ratings.length > 0
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
            : 0;
        return {
          id: prof.id,
          name: prof.name,
          title: titleMap[prof.title] || prof.title,
          dept: prof.department.code,
          rating: Math.round(avgRating * 10) / 10,
          reviews: ratings.length,
        };
      })
      .filter((p) => p.reviews > 0)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);

    // Combine and sort recent reviews
    const recentReviews = [
      ...recentCourseReviews.map((r) => ({
        id: r.id,
        type: "course" as const,
        code: r.course.code,
        name: r.course.name,
        rating: r.overallRating,
        comment: r.comment,
        author: r.isAnonymous ? "Anonim" : r.user.name,
        time: formatTimeAgo(r.createdAt),
        createdAt: r.createdAt,
      })),
      ...recentProfessorReviews.map((r) => ({
        id: r.id,
        type: "professor" as const,
        code: `${titleMap[r.professor.title] || ""} ${r.professor.name}`,
        name: "Akademisyen",
        rating: r.overallRating,
        comment: r.comment,
        author: r.isAnonymous ? "Anonim" : r.user.name,
        time: formatTimeAgo(r.createdAt),
        createdAt: r.createdAt,
      })),
    ]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)
      .map(({ createdAt, ...rest }) => {
        void createdAt;
        return rest;
      });

    // Format top courses
    const formattedTopCourses = topCourses
      .filter((c) => c._count.reviews > 0)
      .map((course) => ({
        id: course.id,
        code: course.code,
        name: course.name,
        reviews: course._count.reviews,
      }));

    return NextResponse.json({
      stats: {
        totalCourses,
        totalProfessors,
        totalReviews: totalCourseReviews + totalProfessorReviews,
        totalUsers,
      },
      recentReviews,
      topCourses: formattedTopCourses,
      topProfessors: professorsWithRatings,
    });
  } catch (error) {
    console.error("Home stats error:", error);
    return NextResponse.json({ error: "Veriler yüklenemedi" }, { status: 500 });
  }
}
