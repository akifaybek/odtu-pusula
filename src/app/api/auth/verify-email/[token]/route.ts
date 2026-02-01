import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/auth/verify-email/[token]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Token'ı bul
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      // Geçersiz token - hata sayfasına yönlendir
      return NextResponse.redirect(
        `${appUrl}/giris?error=invalid_token&message=${encodeURIComponent(
          "Geçersiz veya süresi dolmuş doğrulama linki."
        )}`
      );
    }

    // Token süresini kontrol et
    if (new Date() > verificationToken.expires) {
      // Süresi dolmuş token'ı sil
      await prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      });

      return NextResponse.redirect(
        `${appUrl}/giris?error=expired_token&message=${encodeURIComponent(
          "Doğrulama linkinin süresi dolmuş. Lütfen yeni link talep edin."
        )}`
      );
    }

    // Kullanıcıyı bul ve emailVerified'ı güncelle
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.email },
    });

    if (!user) {
      return NextResponse.redirect(
        `${appUrl}/giris?error=user_not_found&message=${encodeURIComponent(
          "Kullanıcı bulunamadı."
        )}`
      );
    }

    // Transaction ile emailVerified güncelle ve token'ı sil
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      }),
      prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      }),
    ]);

    // Başarılı - anasayfaya yönlendir
    return NextResponse.redirect(
      `${appUrl}/anasayfa?verified=true&message=${encodeURIComponent(
        "Email adresiniz başarıyla doğrulandı!"
      )}`
    );
  } catch (error) {
    console.error("Verify email error:", error);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(
      `${appUrl}/giris?error=verification_failed&message=${encodeURIComponent(
        "Doğrulama sırasında bir hata oluştu."
      )}`
    );
  }
}
