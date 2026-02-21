import { Metadata } from "next";
import prisma from "@/lib/prisma";
import ProfessorClientPage from "./ProfessorClientPage";
import { Title } from "@prisma/client";

type Props = {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Title mapping for SEO description
const titleMap: Record<Title, string> = {
    PROF_DR: "Prof. Dr.",
    ASSOC_PROF_DR: "Doç. Dr.",
    ASST_PROF_DR: "Dr. Öğr. Üyesi",
    LECTURER: "Öğr. Gör.",
    RES_ASST: "Arş. Gör.",
};

export async function generateMetadata(
    { params }: Props
): Promise<Metadata> {
    const { id } = await params;

    const professor = await prisma.professor.findUnique({
        where: { id },
        select: {
            name: true,
            title: true,
            department: {
                select: {
                    name: true,
                },
            },
            _count: {
                select: { reviews: true }
            }
        },
    });

    if (!professor) {
        return {
            title: "Hoca Bulunamadı | ODTÜ Pusula",
        };
    }

    const titleStr = titleMap[professor.title] || professor.title;

    return {
        title: `${titleStr} ${professor.name} - Yorumlar | ODTÜ Pusula`,
        description: `${professor.department.name} hocası ${titleStr} ${professor.name} hakkında ${professor._count.reviews} öğrenci yorumunu oku veya değerlendirme yaz.`,
        openGraph: {
            title: `${titleStr} ${professor.name} - Yorumlar`,
            description: `ODTÜ ${titleStr} ${professor.name} hakkında öğrenci görüşleri.`,
        },
    };
}

export default function Page() {
  return <ProfessorClientPage />;
}
