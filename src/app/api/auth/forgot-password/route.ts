import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { z } from "zod";
import crypto from "crypto";
import { buildRateLimitHeaders, checkRateLimitByPolicy, getClientIp } from "@/lib/rate-limit";

// Validation schema
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Geçerli bir email adresi girin")
    .refine(
      (email) => email.endsWith("@metu.edu.tr"),
      "Sadece @metu.edu.tr uzantılı email adresleri kabul edilmektedir"
    ),
});

// POST /api/auth/forgot-password
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
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
    const normalizedEmail = email.toLowerCase().trim();

    // Rate limiting - hem IP hem email bazında
    const rateLimitResult = await checkRateLimitByPolicy("email", `forgot-password:${ip}:${normalizedEmail}`);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Çok fazla deneme. Lütfen daha sonra tekrar deneyin." },
        {
          status: 429,
          headers: buildRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // Check if user exists - now we inform the user if not registered
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Bu email adresi ile kayıtlı bir hesap bulunamadı." },
        { status: 404 }
      );
    }

    // Delete previous tokens
    await prisma.passwordResetToken.deleteMany({
      where: { email: normalizedEmail },
    });

    // Create new token (UUID + timestamp for extra security)
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token
    await prisma.passwordResetToken.create({
      data: {
        email: normalizedEmail,
        token,
        expires,
      },
    });

    // Create reset link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${appUrl}/reset-password/${token}`;

    // Send email
    const emailResult = await sendPasswordResetEmail({
      email: normalizedEmail,
      resetLink,
    });

    if (!emailResult.success) {
      console.error("Email send failed:", emailResult.error);
      return NextResponse.json(
        { error: "Email gönderilemedi. Lütfen daha sonra tekrar deneyin." },
        { status: 500 }
      );
    }

    console.log(`✅ Password reset email sent to ${normalizedEmail}`);

    return NextResponse.json({
      message: "Şifre sıfırlama linki email adresinize gönderildi.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
