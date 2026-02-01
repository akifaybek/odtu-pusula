import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    // Get current date info
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Fetch all stats in parallel
    const [
      totalUsers,
      totalCourses,
      totalProfessors,
      totalCourseReviews,
      totalProfessorReviews,
      pendingReports,
      newUsersToday,
      newCourseReviewsToday,
      newProfessorReviewsToday,
      recentCourseReviews,
      recentProfessorReviews,
      recentUsers,
      weeklyUserStats,
      weeklyCourseReviewStats,
      weeklyProfessorReviewStats,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.course.count(),
      prisma.professor.count(),
      prisma.courseReview.count(),
      prisma.professorReview.count(),
      prisma.report.count({ where: { status: "PENDING" } }),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.courseReview.count({ where: { createdAt: { gte: today } } }),
      prisma.professorReview.count({ where: { createdAt: { gte: today } } }),
      prisma.courseReview.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true } },
          course: { select: { code: true } },
        },
      }),
      prisma.professorReview.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true } },
          professor: { select: { name: true } },
        },
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { name: true, createdAt: true },
      }),
      // Weekly stats - users
      prisma.$queryRaw`
        SELECT DATE("createdAt") as date, COUNT(*)::int as count
        FROM "User"
        WHERE "createdAt" >= ${weekAgo}
        GROUP BY DATE("createdAt")
        ORDER BY date
      ` as Promise<{ date: Date; count: number }[]>,
      // Weekly stats - course reviews
      prisma.$queryRaw`
        SELECT DATE("createdAt") as date, COUNT(*)::int as count
        FROM "CourseReview"
        WHERE "createdAt" >= ${weekAgo}
        GROUP BY DATE("createdAt")
        ORDER BY date
      ` as Promise<{ date: Date; count: number }[]>,
      // Weekly stats - professor reviews
      prisma.$queryRaw`
        SELECT DATE("createdAt") as date, COUNT(*)::int as count
        FROM "ProfessorReview"
        WHERE "createdAt" >= ${weekAgo}
        GROUP BY DATE("createdAt")
        ORDER BY date
      ` as Promise<{ date: Date; count: number }[]>,
    ]);

    // Build recent activity
    const recentActivity = [
      ...recentCourseReviews.map((r) => ({
        type: "review",
        description: `${r.user.name} ${r.course.code} dersini değerlendirdi`,
        time: formatTimeAgo(r.createdAt),
      })),
      ...recentProfessorReviews.map((r) => ({
        type: "review",
        description: `${r.user.name} ${r.professor.name} hocayı değerlendirdi`,
        time: formatTimeAgo(r.createdAt),
      })),
      ...recentUsers.map((u) => ({
        type: "user",
        description: `${u.name} kayıt oldu`,
        time: formatTimeAgo(u.createdAt),
      })),
    ]
      .sort((a, b) => {
        const timeA = parseTimeAgo(a.time);
        const timeB = parseTimeAgo(b.time);
        return timeA - timeB;
      })
      .slice(0, 10);

    // Build weekly stats
    const weeklyStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const userCount = weeklyUserStats.find(
        (s) => s.date.toISOString().split("T")[0] === dateStr
      )?.count || 0;
      const courseReviewCount = weeklyCourseReviewStats.find(
        (s) => s.date.toISOString().split("T")[0] === dateStr
      )?.count || 0;
      const professorReviewCount = weeklyProfessorReviewStats.find(
        (s) => s.date.toISOString().split("T")[0] === dateStr
      )?.count || 0;

      weeklyStats.push({
        date: dateStr,
        users: userCount,
        reviews: courseReviewCount + professorReviewCount,
      });
    }

    return NextResponse.json({
      totalUsers,
      totalCourses,
      totalProfessors,
      totalCourseReviews,
      totalProfessorReviews,
      pendingReports,
      newUsersToday,
      newReviewsToday: newCourseReviewsToday + newProfessorReviewsToday,
      recentActivity,
      weeklyStats,
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Az önce";
  if (minutes < 60) return `${minutes} dakika önce`;
  if (hours < 24) return `${hours} saat önce`;
  return `${days} gün önce`;
}

function parseTimeAgo(time: string): number {
  if (time === "Az önce") return 0;
  const match = time.match(/(\d+)/);
  if (!match) return 0;
  const num = parseInt(match[1]);
  if (time.includes("dakika")) return num;
  if (time.includes("saat")) return num * 60;
  if (time.includes("gün")) return num * 1440;
  return 0;
}
