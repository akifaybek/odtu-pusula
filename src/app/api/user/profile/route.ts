import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { Year } from "@prisma/client";
import { z } from "zod";

// Delete confirmation schema
const deleteAccountSchema = z.object({
  password: z.string().min(1, "Şifre gereklidir"),
  confirmation: z.literal("DELETE", {
    message: "Onay metni 'DELETE' olmalıdır",
  }),
});

// GET: Kullanıcı profili
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        year: true,
        image: true,
        createdAt: true,
        department: {
          select: {
            id: true,
            code: true,
            name: true,
            faculty: true,
          },
        },
        _count: {
          select: {
            courseReviews: true,
            professorReviews: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    // Toplam beğeni sayısını hesapla
    const courseReviewLikes = await prisma.courseReview.aggregate({
      where: { userId: session.user.id },
      _sum: { likes: true },
    });

    const professorReviewLikes = await prisma.professorReview.aggregate({
      where: { userId: session.user.id },
      _sum: { likes: true },
    });

    const totalLikes =
      (courseReviewLikes._sum.likes || 0) +
      (professorReviewLikes._sum.likes || 0);

    return NextResponse.json({
      ...user,
      stats: {
        totalReviews: user._count.courseReviews + user._count.professorReviews,
        courseReviews: user._count.courseReviews,
        professorReviews: user._count.professorReviews,
        totalLikes,
      },
    });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { error: "Profil yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

// PUT: Profil güncelleme
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, departmentId, year } = body;

    const updateData: {
      name?: string;
      departmentId?: string | null;
      year?: Year | null;
    } = {};

    if (name !== undefined) {
      if (!name || name.trim().length < 2) {
        return NextResponse.json(
          { error: "İsim en az 2 karakter olmalıdır" },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (departmentId !== undefined) {
      if (departmentId) {
        const department = await prisma.department.findUnique({
          where: { id: departmentId },
        });
        if (!department) {
          return NextResponse.json(
            { error: "Geçersiz bölüm" },
            { status: 400 }
          );
        }
      }
      updateData.departmentId = departmentId || null;
    }

    if (year !== undefined) {
      const validYears: Year[] = [
        "PREP",
        "FRESHMAN",
        "SOPHOMORE",
        "JUNIOR",
        "SENIOR",
        "MASTERS",
        "PHD",
      ];
      if (year && !validYears.includes(year)) {
        return NextResponse.json(
          { error: "Geçersiz sınıf" },
          { status: 400 }
        );
      }
      updateData.year = year || null;
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        year: true,
        department: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json(
      { error: "Profil güncellenirken hata oluştu" },
      { status: 500 }
    );
  }
}

// PATCH: Şifre değiştirme
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Mevcut şifre ve yeni şifre gereklidir" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Yeni şifre en az 6 karakter olmalıdır" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Mevcut şifre yanlış" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: "Şifre başarıyla değiştirildi" });
  } catch (error) {
    console.error("Password PATCH error:", error);
    return NextResponse.json(
      { error: "Şifre değiştirilirken hata oluştu" },
      { status: 500 }
    );
  }
}

// DELETE: Hesap silme (GDPR/KVKK uyumlu)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validation
    const validationResult = deleteAccountSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { password } = validationResult.data;

    // Kullanıcıyı bul ve şifreyi doğrula
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, password: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Kullanıcı bulunamadı" },
        { status: 404 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Şifre yanlış" },
        { status: 400 }
      );
    }

    // Transaction ile tüm kullanıcı verilerini sil
    await prisma.$transaction(async (tx) => {
      // 1. Review likes'ları sil
      await tx.reviewLike.deleteMany({
        where: { userId: user.id },
      });

      // 2. Course review'ları sil (like count'ları da silinir)
      await tx.courseReview.deleteMany({
        where: { userId: user.id },
      });

      // 3. Professor review'ları sil
      await tx.professorReview.deleteMany({
        where: { userId: user.id },
      });

      // 4. Report'ları sil
      await tx.report.deleteMany({
        where: { reporterId: user.id },
      });

      // 5. Email verification token'ları sil
      await tx.emailVerificationToken.deleteMany({
        where: { email: user.email },
      });

      // 6. Password reset token'ları sil
      await tx.passwordResetToken.deleteMany({
        where: { email: user.email },
      });

      // 7. Session'ları sil (varsa)
      await tx.session.deleteMany({
        where: { userId: user.id },
      });

      // 8. Account'ları sil (OAuth varsa)
      await tx.account.deleteMany({
        where: { userId: user.id },
      });

      // 9. Son olarak kullanıcıyı sil
      await tx.user.delete({
        where: { id: user.id },
      });
    });

    return NextResponse.json({
      message: "Hesabınız ve tüm verileriniz başarıyla silindi.",
    });
  } catch (error) {
    console.error("Account DELETE error:", error);
    return NextResponse.json(
      { error: "Hesap silinirken hata oluştu" },
      { status: 500 }
    );
  }
}
