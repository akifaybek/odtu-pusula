import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        faculty: true,
      },
      orderBy: { code: "asc" },
    });

    return NextResponse.json(departments);
  } catch (error) {
    console.error("Departments GET error:", error);
    return NextResponse.json(
      { error: "Bölümler yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}
