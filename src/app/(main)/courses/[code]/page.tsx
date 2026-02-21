import { Metadata } from "next";
import prisma from "@/lib/prisma";
import CourseClientPage from "./CourseClientPage";

type Props = {
    params: Promise<{ code: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
    { params }: Props
): Promise<Metadata> {
    const { code } = await params;
    const decodedCode = code.replace(/-/g, " ").toUpperCase();

    const course = await prisma.course.findFirst({
        where: {
            code: {
                contains: decodedCode,
                mode: "insensitive",
            },
        },
        select: {
            code: true,
            name: true,
            description: true,
        },
    });

    if (!course) {
        return {
            title: "Ders Bulunamadı | ODTÜ Pusula",
        };
    }

    return {
        title: `${course.code} - ${course.name} | ODTÜ Pusula`,
        description: course.description || `${course.code} dersi hakkında yorumlar, notlar ve değerlendirmeler.`,
        openGraph: {
            title: `${course.code} - ${course.name}`,
            description: course.description || `ODTÜ ${course.code} dersi öğrenci yorumları.`,
        },
    };
}

export default function Page() {
  return <CourseClientPage />;
}
