import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const suggestionSchema = z.object({
  type: z.enum(["course", "professor"]),
  courseCode: z.string().optional(),
  courseName: z.string().optional(),
  professorName: z.string().optional(),
  department: z.string().optional(),
  additionalInfo: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
});

// POST /api/suggestions - Yeni öneri oluştur
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    const validationResult = suggestionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Geçersiz veri" },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Validation
    if (data.type === "course" && !data.courseCode && !data.courseName) {
      return NextResponse.json(
        { error: "Ders kodu veya adı gerekli" },
        { status: 400 }
      );
    }

    if (data.type === "professor" && !data.professorName) {
      return NextResponse.json(
        { error: "Hoca adı gerekli" },
        { status: 400 }
      );
    }

    // Öneriyi veritabanına kaydet
    const suggestion = await prisma.suggestion.create({
      data: {
        type: data.type,
        courseCode: data.courseCode || null,
        courseName: data.courseName || null,
        professorName: data.professorName || null,
        department: data.department || null,
        additionalInfo: data.additionalInfo || null,
        contactEmail: data.email || null,
        userId: session?.user?.id || null,
        status: "pending",
      },
    });

    return NextResponse.json(
      { message: "Öneri başarıyla gönderildi", id: suggestion.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Suggestion POST error:", error);
    return NextResponse.json(
      { error: "Öneri gönderilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// GET /api/suggestions - Önerileri listele (admin için)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Giriş yapmalısınız" },
        { status: 401 }
      );
    }

    // Admin kontrolü
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Bu işlem için yetkiniz yok" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";

    const suggestions = await prisma.suggestion.findMany({
      where: status !== "all" ? { status } : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Suggestions GET error:", error);
    return NextResponse.json(
      { error: "Öneriler yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
