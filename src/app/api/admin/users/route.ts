import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin, requireAdminOnly } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    const users = await prisma.user.findMany({
      where: role ? { role: role as "USER" | "MODERATOR" | "ADMIN" } : undefined,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBanned: true,
        emailVerified: true,
        createdAt: true,
        _count: {
          select: {
            courseReviews: true,
            professorReviews: true,
          },
        },
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Admin users error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Kullanıcı işlemleri için sadece ADMIN yetkisi gerekli
    const { session, error } = await requireAdminOnly();
    if (error) return error;

    const { userId, action, role } = await request.json();

    if (!userId || !action) {
      return NextResponse.json({ error: "Eksik parametreler" }, { status: 400 });
    }

    // Prevent self-modification
    if (userId === session.user.id) {
      return NextResponse.json({ error: "Kendi hesabınızı değiştiremezsiniz" }, { status: 400 });
    }

    switch (action) {
      case "ban":
        await prisma.user.update({
          where: { id: userId },
          data: { isBanned: true },
        });
        break;
      case "unban":
        await prisma.user.update({
          where: { id: userId },
          data: { isBanned: false },
        });
        break;
      case "role":
        if (!role || !["USER", "MODERATOR", "ADMIN"].includes(role)) {
          return NextResponse.json({ error: "Geçersiz rol" }, { status: 400 });
        }
        await prisma.user.update({
          where: { id: userId },
          data: { role },
        });
        break;
      default:
        return NextResponse.json({ error: "Geçersiz işlem" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin user action error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
