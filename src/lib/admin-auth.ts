import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { Session } from "next-auth";

interface AdminAuthResult {
  session: Session;
  error?: never;
}

interface AdminAuthError {
  session?: never;
  error: NextResponse;
}

type RequireAdminResult = AdminAuthResult | AdminAuthError;

/**
 * Admin veya Moderator yetkisi kontrolü yapar.
 * Her admin API route'unda kullanılmalıdır.
 */
export async function requireAdmin(): Promise<RequireAdminResult> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      error: NextResponse.json(
        { error: "Oturum gerekli" },
        { status: 401 }
      ),
    };
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR") {
    return {
      error: NextResponse.json(
        { error: "Yetkisiz erişim" },
        { status: 403 }
      ),
    };
  }

  return { session };
}

/**
 * Sadece ADMIN yetkisi kontrolü yapar.
 * Kritik işlemler için kullanılmalıdır (rol değiştirme, kullanıcı silme vb.)
 */
export async function requireAdminOnly(): Promise<RequireAdminResult> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      error: NextResponse.json(
        { error: "Oturum gerekli" },
        { status: 401 }
      ),
    };
  }

  if (session.user.role !== "ADMIN") {
    return {
      error: NextResponse.json(
        { error: "Bu işlem için Admin yetkisi gerekli" },
        { status: 403 }
      ),
    };
  }

  return { session };
}
