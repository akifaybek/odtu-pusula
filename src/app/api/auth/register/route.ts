import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().min(2, "Isim en az 2 karakter olmalidir"),
  email: z
    .string()
    .email("Gecerli bir email adresi giriniz")
    .refine(
      (email) => email.endsWith("@metu.edu.tr"),
      "Sadece @metu.edu.tr mail adresleri kabul edilir"
    ),
  password: z
    .string()
    .min(6, "Sifre en az 6 karakter olmalidir"),
  department: z.string().min(1, "Bolum seciniz"),
  year: z.enum(["PREP", "FRESHMAN", "SOPHOMORE", "JUNIOR", "SENIOR", "MASTERS", "PHD"]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Zod validation
    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((e) => e.message).join(", ");
      return NextResponse.json(
        { error: errors },
        { status: 400 }
      );
    }

    const { name, email, password, department, year } = validationResult.data;

    // Email zaten kayıtlı mı?
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu email adresi zaten kayitli" },
        { status: 400 }
      );
    }

    // Bölümü bul
    const dept = await prisma.department.findUnique({
      where: { code: department },
    });

    if (!dept) {
      return NextResponse.json(
        { error: "Gecersiz bolum" },
        { status: 400 }
      );
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 12);

    // Kullanıcıyı oluştur
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        departmentId: dept.id,
        year: year,
      },
    });

    return NextResponse.json(
      {
        message: "Kayit basarili",
        user: { id: user.id, name: user.name, email: user.email },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Kayit sirasinda bir hata olustu" },
      { status: 500 }
    );
  }
}
