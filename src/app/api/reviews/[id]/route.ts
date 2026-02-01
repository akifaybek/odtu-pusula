import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PUT: Değerlendirme güncelleme
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { type, ...updateData } = body;

    if (!type || !["course", "professor"].includes(type)) {
      return NextResponse.json(
        { error: "Geçersiz değerlendirme tipi" },
        { status: 400 }
      );
    }

    if (type === "course") {
      const review = await prisma.courseReview.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!review) {
        return NextResponse.json(
          { error: "Değerlendirme bulunamadı" },
          { status: 404 }
        );
      }

      if (review.userId !== session.user.id) {
        return NextResponse.json(
          { error: "Bu değerlendirmeyi düzenleme yetkiniz yok" },
          { status: 403 }
        );
      }

      const {
        difficultyRating,
        workloadRating,
        usefulnessRating,
        overallRating,
        comment,
        grade,
        isAnonymous,
      } = updateData;

      const updated = await prisma.courseReview.update({
        where: { id },
        data: {
          ...(difficultyRating !== undefined && { difficultyRating }),
          ...(workloadRating !== undefined && { workloadRating }),
          ...(usefulnessRating !== undefined && { usefulnessRating }),
          ...(overallRating !== undefined && { overallRating }),
          ...(comment !== undefined && { comment }),
          ...(grade !== undefined && { grade }),
          ...(isAnonymous !== undefined && { isAnonymous }),
        },
        include: {
          course: { select: { code: true, name: true } },
          professor: { select: { name: true, title: true } },
        },
      });

      return NextResponse.json(updated);
    } else {
      const review = await prisma.professorReview.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!review) {
        return NextResponse.json(
          { error: "Değerlendirme bulunamadı" },
          { status: 404 }
        );
      }

      if (review.userId !== session.user.id) {
        return NextResponse.json(
          { error: "Bu değerlendirmeyi düzenleme yetkiniz yok" },
          { status: 403 }
        );
      }

      const {
        teachingRating,
        gradingRating,
        accessRating,
        overallRating,
        comment,
        wouldTakeAgain,
        isAnonymous,
      } = updateData;

      const updated = await prisma.professorReview.update({
        where: { id },
        data: {
          ...(teachingRating !== undefined && { teachingRating }),
          ...(gradingRating !== undefined && { gradingRating }),
          ...(accessRating !== undefined && { accessRating }),
          ...(overallRating !== undefined && { overallRating }),
          ...(comment !== undefined && { comment }),
          ...(wouldTakeAgain !== undefined && { wouldTakeAgain }),
          ...(isAnonymous !== undefined && { isAnonymous }),
        },
        include: {
          professor: { select: { name: true, title: true } },
          course: { select: { code: true, name: true } },
        },
      });

      return NextResponse.json(updated);
    }
  } catch (error) {
    console.error("Review PUT error:", error);
    return NextResponse.json(
      { error: "Değerlendirme güncellenirken hata oluştu" },
      { status: 500 }
    );
  }
}

// DELETE: Değerlendirme silme
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (!type || !["course", "professor"].includes(type)) {
      return NextResponse.json(
        { error: "Geçersiz değerlendirme tipi" },
        { status: 400 }
      );
    }

    if (type === "course") {
      const review = await prisma.courseReview.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!review) {
        return NextResponse.json(
          { error: "Değerlendirme bulunamadı" },
          { status: 404 }
        );
      }

      if (review.userId !== session.user.id) {
        return NextResponse.json(
          { error: "Bu değerlendirmeyi silme yetkiniz yok" },
          { status: 403 }
        );
      }

      await prisma.courseReview.delete({ where: { id } });
    } else {
      const review = await prisma.professorReview.findUnique({
        where: { id },
        select: { userId: true },
      });

      if (!review) {
        return NextResponse.json(
          { error: "Değerlendirme bulunamadı" },
          { status: 404 }
        );
      }

      if (review.userId !== session.user.id) {
        return NextResponse.json(
          { error: "Bu değerlendirmeyi silme yetkiniz yok" },
          { status: 403 }
        );
      }

      await prisma.professorReview.delete({ where: { id } });
    }

    return NextResponse.json({ message: "Değerlendirme silindi" });
  } catch (error) {
    console.error("Review DELETE error:", error);
    return NextResponse.json(
      { error: "Değerlendirme silinirken hata oluştu" },
      { status: 500 }
    );
  }
}
