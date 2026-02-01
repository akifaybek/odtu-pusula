import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Title mapping
const titleMap: Record<string, string> = {
  PROF_DR: "Prof. Dr.",
  ASSOC_PROF_DR: "Doç. Dr.",
  ASST_PROF_DR: "Dr. Öğr. Üyesi",
  LECTURER: "Öğr. Gör.",
  RES_ASST: "Arş. Gör.",
};

// GET /api/search?q=...&type=all|courses|professors&limit=10
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() || "";
    const type = searchParams.get("type") || "all";
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 20);

    // Minimum 2 karakter gerekli
    if (query.length < 2) {
      return NextResponse.json({
        courses: [],
        professors: [],
      });
    }

    const results: {
      courses: Array<{
        code: string;
        name: string;
        department: string;
        rating: number;
      }>;
      professors: Array<{
        id: string;
        name: string;
        title: string;
        department: string;
        rating: number;
      }>;
    } = {
      courses: [],
      professors: [],
    };

    // Ders arama
    if (type === "all" || type === "courses") {
      const courses = await prisma.course.findMany({
        where: {
          OR: [
            { code: { contains: query, mode: "insensitive" } },
            { name: { contains: query, mode: "insensitive" } },
          ],
        },
        include: {
          department: {
            select: { code: true },
          },
          reviews: {
            select: { overallRating: true },
          },
        },
        take: limit,
      });

      results.courses = courses.map((course) => {
        const avgRating =
          course.reviews.length > 0
            ? course.reviews.reduce((sum, r) => sum + r.overallRating, 0) /
              course.reviews.length
            : 0;

        return {
          code: course.code,
          name: course.name,
          department: course.department.code,
          rating: Math.round(avgRating * 10) / 10,
        };
      });
    }

    // Hoca arama
    if (type === "all" || type === "professors") {
      const professors = await prisma.professor.findMany({
        where: {
          name: { contains: query, mode: "insensitive" },
        },
        include: {
          department: {
            select: { code: true },
          },
          reviews: {
            select: { overallRating: true },
          },
        },
        take: limit,
      });

      results.professors = professors.map((professor) => {
        const avgRating =
          professor.reviews.length > 0
            ? professor.reviews.reduce((sum, r) => sum + r.overallRating, 0) /
              professor.reviews.length
            : 0;

        return {
          id: professor.id,
          name: professor.name,
          title: titleMap[professor.title] || professor.title,
          department: professor.department.code,
          rating: Math.round(avgRating * 10) / 10,
        };
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Arama sırasında bir hata oluştu" },
      { status: 500 }
    );
  }
}
