import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";
import { buildRateLimitHeaders, checkRateLimitByPolicy, getClientIp } from "@/lib/rate-limit";

// POST /api/auth/send-verification
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email gereklidir" },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Validate email format
    if (!normalizedEmail.endsWith("@metu.edu.tr")) {
      return NextResponse.json(
        { error: "Sadece @metu.edu.tr email adresleri kabul edilmektedir" },
        { status: 400 }
      );
    }

    // Rate limiting - hem IP hem email bazında
    const rateLimitResult = await checkRateLimitByPolicy(
      "email",
      `send-verification:${ip}:${normalizedEmail}`
    );

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Çok fazla deneme yaptınız. Lütfen daha sonra tekrar deneyin." },
        {
          status: 429,
          headers: buildRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Kullanıcıyı kontrol et
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Güvenlik için aynı mesajı döndür
      return NextResponse.json({
        message: "Eğer bu email kayıtlıysa, doğrulama linki gönderildi.",
      });
    }

    // Zaten doğrulanmış mı?
    if (user.emailVerified) {
      return NextResponse.json(
        { error: "Email adresiniz zaten doğrulanmış" },
        { status: 400 }
      );
    }

    // Önceki token'ları sil
    await prisma.emailVerificationToken.deleteMany({
      where: { email: normalizedEmail },
    });

    // Yeni token oluştur
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 saat

    // Token'ı kaydet
    await prisma.emailVerificationToken.create({
      data: {
        email: normalizedEmail,
        token,
        expires,
      },
    });

    // Verification linki oluştur
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verificationLink = `${appUrl}/api/auth/verify-email/${token}`;

    // Email gönder
    const emailResult = await sendVerificationEmail({
      email: normalizedEmail,
      verificationLink,
    });

    if (!emailResult.success) {
      console.error("Email send failed:", emailResult.error);
      return NextResponse.json(
        { error: "Email gönderilemedi. Lütfen tekrar deneyin." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Doğrulama emaili gönderildi. Lütfen email kutunuzu kontrol edin.",
    });
  } catch (error) {
    console.error("Send verification error:", error);
    return NextResponse.json(
      { error: "Bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
