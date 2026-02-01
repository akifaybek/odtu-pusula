import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { z } from "zod";
import crypto from "crypto";

// Validation schema
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Geçerli bir email adresi giriniz")
    .refine(
      (email) => email.endsWith("@metu.edu.tr"),
      "Sadece @metu.edu.tr mail adresleri kabul edilir"
    ),
});

// Rate limiting - basit in-memory store (production'da Redis kullanılmalı)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 dakika

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(email);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(email, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

// POST /api/auth/forgot-password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    const validationResult = forgotPasswordSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    // Rate limiting
    if (!checkRateLimit(email)) {
      return NextResponse.json(
        { error: "Çok fazla deneme yaptınız. 15 dakika sonra tekrar deneyin." },
        { status: 429 }
      );
    }

    // Kullanıcıyı kontrol et
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Güvenlik: Kullanıcı olup olmadığını açıklamıyoruz
    // Her durumda aynı mesajı döneriz
    if (!user) {
      // Yine de başarılı mesajı dön (güvenlik için)
      return NextResponse.json({
        message: "Eğer bu email kayıtlıysa, şifre sıfırlama linki gönderildi.",
      });
    }

    // Önceki token'ları sil
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    });

    // Yeni token oluştur (UUID + timestamp için ekstra güvenlik)
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 saat

    // Token'ı kaydet
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    // Reset linki oluştur
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${appUrl}/sifre-sifirla/${token}`;

    // Email gönder
    const emailResult = await sendPasswordResetEmail({
      email,
      resetLink,
    });

    if (!emailResult.success) {
      console.error("Email send failed:", emailResult.error);
      // Yine de başarılı mesajı dön (güvenlik için)
    }

    return NextResponse.json({
      message: "Eğer bu email kayıtlıysa, şifre sıfırlama linki gönderildi.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
