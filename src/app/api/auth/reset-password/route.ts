import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Validation schema
const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token gereklidir"),
    newPassword: z
      .string()
      .min(6, "Şifre en az 6 karakter olmalıdır")
      .max(100, "Şifre çok uzun"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

// POST /api/auth/reset-password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    const validationResult = resetPasswordSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { token, newPassword } = validationResult.data;

    // Token'ı bul
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Geçersiz veya süresi dolmuş link. Yeni bir link talep edin." },
        { status: 400 }
      );
    }

    // Token süresini kontrol et
    if (new Date() > resetToken.expires) {
      // Süresi dolmuş token'ı sil
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });

      return NextResponse.json(
        { error: "Bu linkin süresi dolmuş. Yeni bir link talep edin." },
        { status: 400 }
      );
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // Yeni şifreyi hashle
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Transaction ile şifreyi güncelle ve token'ı sil
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      }),
    ]);

    return NextResponse.json({
      message: "Şifreniz başarıyla güncellendi. Şimdi giriş yapabilirsiniz.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Bir hata oluştu. Lütfen tekrar deneyin." },
      { status: 500 }
    );
  }
}
