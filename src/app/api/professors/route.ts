import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Title } from "@prisma/client";

// Türkçe unvan mapping
const titleMap: Record<Title, string> = {
  PROF_DR: "Prof. Dr.",
  ASSOC_PROF_DR: "Doç. Dr.",
  ASST_PROF_DR: "Dr. Öğr. Üyesi",
  LECTURER: "Öğr. Gör.",
  RES_ASST: "Arş. Gör.",
};

// GET /api/professors - Tüm hocaları listele
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Query parametreleri
    const departmentCode = searchParams.get("departmentCode");
    const search = searchParams.get("search");
    const title = searchParams.get("title");
    const sortBy = searchParams.get("sortBy") || "popular"; // popular, rating, name, take-again
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Where koşulları
    const where: {
      department?: { code: string };
      title?: Title;
      name?: { contains: string; mode: "insensitive" };
    } = {};

    if (departmentCode && departmentCode !== "all") {
      where.department = { code: departmentCode };
    }

    if (title && title !== "all") {
      // Türkçe unvandan enum'a çevir
      const titleEntry = Object.entries(titleMap).find(([, v]) => v === title);
      if (titleEntry) {
        where.title = titleEntry[0] as Title;
      }
    }

    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    // Hocaları çek
    const professors = await prisma.professor.findMany({
      where,
      include: {
        department: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        courses: {
          include: {
            course: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
        },
        reviews: {
          select: {
            teachingRating: true,
            gradingRating: true,
            accessRating: true,
            overallRating: true,
            wouldTakeAgain: true,
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

    // Her hoca için istatistik hesapla
    const professorsWithStats = professors.map((professor) => {
      const reviews = professor.reviews;
      const reviewCount = reviews.length;

      let avgTeaching = 0;
      let avgGrading = 0;
      let avgAccess = 0;
      let avgOverall = 0;
      let wouldTakeAgainPercent = 0;

      if (reviewCount > 0) {
        avgTeaching = reviews.reduce((sum, r) => sum + r.teachingRating, 0) / reviewCount;
        avgGrading = reviews.reduce((sum, r) => sum + r.gradingRating, 0) / reviewCount;
        avgAccess = reviews.reduce((sum, r) => sum + r.accessRating, 0) / reviewCount;
        avgOverall = reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviewCount;
        wouldTakeAgainPercent = (reviews.filter((r) => r.wouldTakeAgain).length / reviewCount) * 100;
      }

      return {
        id: professor.id,
        name: professor.name,
        title: titleMap[professor.title],
        titleEnum: professor.title,
        department: professor.department,
        courses: professor.courses.map((cp) => cp.course),
        reviewCount,
        stats: {
          teaching: Math.round(avgTeaching * 10) / 10,
          grading: Math.round(avgGrading * 10) / 10,
          accessibility: Math.round(avgAccess * 10) / 10,
          overall: Math.round(avgOverall * 10) / 10,
          wouldTakeAgainPercent: Math.round(wouldTakeAgainPercent),
        },
      };
    });

    // Sıralama
    const sortedProfessors = [...professorsWithStats].sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.reviewCount - a.reviewCount;
        case "rating":
          return b.stats.overall - a.stats.overall;
        case "name":
          return a.name.localeCompare(b.name, "tr");
        case "take-again":
          return b.stats.wouldTakeAgainPercent - a.stats.wouldTakeAgainPercent;
        default:
          return b.reviewCount - a.reviewCount;
      }
    });

    // Toplam sayı
    const total = await prisma.professor.count({ where });

    return NextResponse.json({
      professors: sortedProfessors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Professors GET error:", error);
    return NextResponse.json(
      { error: "Hocalar yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
