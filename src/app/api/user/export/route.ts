import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: Kullanıcı verilerini dışa aktar (GDPR/KVKK uyumlu)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Oturum açmanız gerekiyor" },
        { status: 401 }
      );
    }

    // Kullanıcının tüm verilerini topla
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        year: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        department: {
          select: {
            code: true,
            name: true,
            faculty: true,
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

    // Ders değerlendirmeleri
    const courseReviews = await prisma.courseReview.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        difficultyRating: true,
        workloadRating: true,
        usefulnessRating: true,
        overallRating: true,
        comment: true,
        grade: true,
        semester: true,
        likes: true,
        status: true,
        isAnonymous: true,
        createdAt: true,
        updatedAt: true,
        course: {
          select: {
            code: true,
            name: true,
          },
        },
        professor: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Hoca değerlendirmeleri
    const professorReviews = await prisma.professorReview.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        teachingRating: true,
        gradingRating: true,
        accessRating: true,
        overallRating: true,
        wouldTakeAgain: true,
        comment: true,
        semester: true,
        likes: true,
        status: true,
        isAnonymous: true,
        createdAt: true,
        updatedAt: true,
        professor: {
          select: {
            name: true,
            title: true,
          },
        },
        course: {
          select: {
            code: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Beğeniler
    const likes = await prisma.reviewLike.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        reviewType: true,
        reviewId: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Raporlar
    const reports = await prisma.report.findMany({
      where: { reporterId: session.user.id },
      select: {
        id: true,
        reason: true,
        description: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Export verisini oluştur
    const exportData = {
      exportInfo: {
        exportDate: new Date().toISOString(),
        exportedBy: user.email,
        platform: "ODTU Pusula",
        dataRetentionPolicy: "Verileriniz hesabınızı silene kadar saklanır.",
      },
      profile: {
        ...user,
        passwordHash: "[HIDDEN FOR SECURITY]",
      },
      statistics: {
        totalCourseReviews: courseReviews.length,
        totalProfessorReviews: professorReviews.length,
        totalLikes: likes.length,
        totalReports: reports.length,
      },
      courseReviews: courseReviews.map((review) => ({
        ...review,
        courseName: `${review.course.code} - ${review.course.name}`,
        professorName: review.professor?.name || null,
        course: undefined,
        professor: undefined,
      })),
      professorReviews: professorReviews.map((review) => ({
        ...review,
        professorName: review.professor.name,
        professorTitle: review.professor.title,
        courseName: review.course
          ? `${review.course.code} - ${review.course.name}`
          : null,
        professor: undefined,
        course: undefined,
      })),
      likes: likes,
      reports: reports.map((report) => ({
        ...report,
        description: report.description || null,
      })),
    };

    // JSON dosyası olarak indir
    const fileName = `odtu-pusula-data-export-${new Date().toISOString().split("T")[0]}.json`;

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Data export error:", error);
    return NextResponse.json(
      { error: "Veriler dışa aktarılırken hata oluştu" },
      { status: 500 }
    );
  }
}
