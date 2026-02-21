import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { resetPasswordSchema } from "@/lib/validation";

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

    // Validate token format (64 hex characters)
    if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
      return NextResponse.json(
        { error: "Geçersiz token formatı" },
        { status: 400 }
      );
    }

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

    // Yeni şifreyi hashle (consistent salt rounds)
    const hashedPassword = await bcrypt.hash(newPassword, 12);

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
