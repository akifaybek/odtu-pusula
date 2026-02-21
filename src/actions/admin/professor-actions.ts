"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Prisma, Title } from "@prisma/client";

// Admin check helper
async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
        throw new Error("Unauthorized");
    }
    return session;
}

export async function getProfessors(
    page: number = 1,
    limit: number = 10,
    search: string = ""
) {
    await checkAdmin();
    const skip = (page - 1) * limit;

    const where: Prisma.ProfessorWhereInput = search
        ? {
            name: { contains: search, mode: "insensitive" },
        }
        : {};

    const [professors, total] = await Promise.all([
        prisma.professor.findMany({
            where,
            include: {
                department: true,
            },
            skip,
            take: limit,
            orderBy: { name: "asc" },
        }),
        prisma.professor.count({ where }),
    ]);

    return {
        professors,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

// For dropdowns
export async function getAllProfessors() {
    await checkAdmin();
    return prisma.professor.findMany({
        select: { id: true, name: true, title: true },
        orderBy: { name: "asc" },
    });
}

export async function createProfessor(data: {
    name: string;
    title: Title;
    departmentId: string;
    email?: string;
    image?: string;
}) {
    await checkAdmin();

    try {
        const professor = await prisma.professor.create({
            data: {
                name: data.name,
                title: data.title,
                departmentId: data.departmentId,
                email: data.email,
                image: data.image,
            },
        });

        revalidatePath("/admin/professors");
        return { success: true, professor };
    } catch (error) {
        console.error("Create professor error:", error);
        return { success: false, error: "Hoca oluşturulurken bir hata oluştu." };
    }
}

export async function updateProfessor(
    id: string,
    data: {
        name: string;
        title: Title;
        departmentId: string;
        email?: string;
        image?: string;
    }
) {
    await checkAdmin();

    try {
        await prisma.professor.update({
            where: { id },
            data: {
                name: data.name,
                title: data.title,
                departmentId: data.departmentId,
                email: data.email,
                image: data.image,
            },
        });

        revalidatePath("/admin/professors");
        return { success: true };
    } catch (error) {
        console.error("Update professor error:", error);
        return { success: false, error: "Hoca güncellenirken bir hata oluştu." };
    }
}

export async function deleteProfessor(id: string) {
    await checkAdmin();

    try {
        await prisma.professor.delete({
            where: { id },
        });
        revalidatePath("/admin/professors");
        return { success: true };
    } catch (error) {
        console.error("Delete professor error:", error);
        return { success: false, error: "Hoca silinirken bir hata oluştu." };
    }
}
