import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Bu endpoint bir cron job tarafından çağrılabilir
// Örnek: Vercel Cron Jobs veya external cron service

// Secret key for cron job authentication
const CRON_SECRET = process.env.CRON_SECRET;

// GET /api/cron/cleanup-tokens
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (skip in development)
    const authHeader = request.headers.get("authorization");
    const providedSecret = authHeader?.replace("Bearer ", "");

    if (process.env.NODE_ENV === "production") {
      if (!CRON_SECRET || providedSecret !== CRON_SECRET) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    const now = new Date();

    // Delete expired password reset tokens
    const deletedPasswordTokens = await prisma.passwordResetToken.deleteMany({
      where: {
        expires: { lt: now },
      },
    });

    // Delete expired email verification tokens
    const deletedVerificationTokens = await prisma.emailVerificationToken.deleteMany({
      where: {
        expires: { lt: now },
      },
    });

    console.log(`🧹 Token cleanup completed:
      - Password reset tokens deleted: ${deletedPasswordTokens.count}
      - Email verification tokens deleted: ${deletedVerificationTokens.count}
    `);

    return NextResponse.json({
      success: true,
      deleted: {
        passwordResetTokens: deletedPasswordTokens.count,
        emailVerificationTokens: deletedVerificationTokens.count,
      },
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Token cleanup error:", error);
    return NextResponse.json(
      { error: "Cleanup failed" },
      { status: 500 }
    );
  }
}
