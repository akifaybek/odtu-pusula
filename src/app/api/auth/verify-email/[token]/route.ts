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

    // Validate token format (64 hex characters)
    if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
      return NextResponse.redirect(
        `${appUrl}/login?error=invalid_token`
      );
    }

    // Token'ı bul
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      // Geçersiz token - hata sayfasına yönlendir
      return NextResponse.redirect(
        `${appUrl}/login?error=invalid_token`
      );
    }

    // Token süresini kontrol et
    if (new Date() > verificationToken.expires) {
      // Süresi dolmuş token'ı sil
      await prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      });

      return NextResponse.redirect(
        `${appUrl}/login?error=expired_token`
      );
    }

    // Kullanıcıyı bul ve emailVerified'ı güncelle
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.email },
    });

    if (!user) {
      return NextResponse.redirect(
        `${appUrl}/login?error=user_not_found`
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

    // Başarılı - login sayfasına yönlendir
    return NextResponse.redirect(
      `${appUrl}/login?verified=true`
    );
  } catch (error) {
    console.error("Verify email error:", error);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(
      `${appUrl}/login?error=verification_failed`
    );
  }
}
