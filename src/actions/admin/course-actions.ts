"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

// Admin check helper
async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
        throw new Error("Unauthorized");
    }
    return session;
}

export async function getCourses(
    page: number = 1,
    limit: number = 10,
    search: string = ""
) {
    await checkAdmin();
    const skip = (page - 1) * limit;

    const where: Prisma.CourseWhereInput = search
        ? {
            OR: [
                { name: { contains: search, mode: "insensitive" } },
                { code: { contains: search, mode: "insensitive" } },
            ],
        }
        : {};

    const [courses, total] = await Promise.all([
        prisma.course.findMany({
            where,
            include: {
                department: true,
                professors: {
                    include: {
                        professor: true,
                    },
                },
            },
            skip,
            take: limit,
            orderBy: { code: "asc" },
        }),
        prisma.course.count({ where }),
    ]);

    return {
        courses,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function getDepartments() {
    await checkAdmin();
    return prisma.department.findMany({
        orderBy: { name: "asc" },
    });
}

export async function createCourse(data: {
    code: string;
    name: string;
    departmentId: string;
    credits: number;
    description?: string;
    professorIds?: string[];
}) {
    await checkAdmin();

    try {
        const course = await prisma.course.create({
            data: {
                code: data.code,
                name: data.name,
                departmentId: data.departmentId,
                credits: data.credits,
                description: data.description,
                professors: {
                    create: data.professorIds?.map((id) => ({
                        professor: { connect: { id } },
                    })),
                },
            },
        });

        revalidatePath("/admin/courses");
        return { success: true, course };
    } catch (error) {
        console.error("Create course error:", error);
        return { success: false, error: "Ders oluşturulurken bir hata oluştu." };
    }
}

export async function updateCourse(
    id: string,
    data: {
        code: string;
        name: string;
        departmentId: string;
        credits: number;
        description?: string;
        professorIds?: string[];
    }
) {
    await checkAdmin();

    try {
        // Transaction to handle professor updates if needed
        await prisma.$transaction(async (tx) => {
            // 1. Update basic info
            await tx.course.update({
                where: { id },
                data: {
                    code: data.code,
                    name: data.name,
                    departmentId: data.departmentId,
                    credits: data.credits,
                    description: data.description,
                },
            });

            // 2. Update professors if provided
            if (data.professorIds) {
                // Remove old connections
                await tx.courseProfessor.deleteMany({
                    where: { courseId: id },
                });

                // Add new connections
                if (data.professorIds.length > 0) {
                    await tx.courseProfessor.createMany({
                        data: data.professorIds.map((profId) => ({
                            courseId: id,
                            professorId: profId,
                        })),
                    });
                }
            }
        });

        revalidatePath("/admin/courses");
        return { success: true };
    } catch (error) {
        console.error("Update course error:", error);
        return { success: false, error: "Ders güncellenirken bir hata oluştu." };
    }
}

export async function deleteCourse(id: string) {
    await checkAdmin();

    try {
        await prisma.course.delete({
            where: { id },
        });
        revalidatePath("/admin/courses");
        return { success: true };
    } catch (error) {
        console.error("Delete course error:", error);
        return { success: false, error: "Ders silinirken bir hata oluştu." };
    }
}
