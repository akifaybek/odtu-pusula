import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

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
        emailVerified: null, // Email doğrulanmamış
      },
    });

    // Email doğrulama token'ı oluştur
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 saat

    await prisma.emailVerificationToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    // Doğrulama emaili gönder
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verificationLink = `${appUrl}/api/auth/verify-email/${token}`;

    const emailResult = await sendVerificationEmail({
      email,
      verificationLink,
    });

    if (!emailResult.success) {
      console.error("Verification email failed:", emailResult.error);
      // Email gönderilmese bile kayıt başarılı, kullanıcı sonra tekrar gönderebilir
    }

    return NextResponse.json(
      {
        message: "Kayit basarili. Email adresinizi dogrulayin.",
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
