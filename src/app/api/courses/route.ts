import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/courses - Tüm dersleri listele
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Query parametreleri
    const departmentId = searchParams.get("departmentId");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "popular"; // popular, rating, difficulty-asc, difficulty-desc, name, code
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Where koşulları
    const where: {
      departmentId?: string;
      OR?: Array<{ code?: { contains: string; mode: "insensitive" }; name?: { contains: string; mode: "insensitive" } }>;
    } = {};

    if (departmentId && departmentId !== "all") {
      where.departmentId = departmentId;
    }

    if (search) {
      where.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    // Dersleri çek
    const courses = await prisma.course.findMany({
      where,
      include: {
        department: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        professors: {
          include: {
            professor: {
              select: {
                id: true,
                name: true,
                title: true,
              },
            },
          },
        },
        reviews: {
          select: {
            difficultyRating: true,
            workloadRating: true,
            usefulnessRating: true,
            overallRating: true,
          },
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
      skip,
      take: limit,
    });

    // Her ders için ortalama hesapla
    const coursesWithStats = courses.map((course) => {
      const reviews = course.reviews;
      const reviewCount = reviews.length;

      let avgDifficulty = 0;
      let avgWorkload = 0;
      let avgUsefulness = 0;
      let avgOverall = 0;

      if (reviewCount > 0) {
        avgDifficulty = reviews.reduce((sum, r) => sum + r.difficultyRating, 0) / reviewCount;
        avgWorkload = reviews.reduce((sum, r) => sum + r.workloadRating, 0) / reviewCount;
        avgUsefulness = reviews.reduce((sum, r) => sum + r.usefulnessRating, 0) / reviewCount;
        avgOverall = reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviewCount;
      }

      return {
        id: course.id,
        code: course.code,
        name: course.name,
        credits: course.credits,
        description: course.description,
        department: course.department,
        professors: course.professors.map((cp) => cp.professor),
        reviewCount,
        stats: {
          difficulty: Math.round(avgDifficulty * 10) / 10,
          workload: Math.round(avgWorkload * 10) / 10,
          usefulness: Math.round(avgUsefulness * 10) / 10,
          overall: Math.round(avgOverall * 10) / 10,
        },
      };
    });

    // Sıralama
    const sortedCourses = [...coursesWithStats].sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.reviewCount - a.reviewCount;
        case "rating":
          return b.stats.overall - a.stats.overall;
        case "difficulty-asc":
          return a.stats.difficulty - b.stats.difficulty;
        case "difficulty-desc":
          return b.stats.difficulty - a.stats.difficulty;
        case "name":
          return a.name.localeCompare(b.name, "tr");
        case "code":
          return a.code.localeCompare(b.code);
        default:
          return b.reviewCount - a.reviewCount;
      }
    });

    // Toplam sayı
    const total = await prisma.course.count({ where });

    return NextResponse.json({
      courses: sortedCourses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Courses GET error:", error);
    return NextResponse.json(
      { error: "Dersler yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
