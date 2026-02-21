import prisma from "@/lib/prisma";
import {
  cleanDatabase,
  createTestCourse,
  createTestCourseReview,
  createTestProfessor,
  createTestUser,
} from "../utils/test-helpers";

describe("Courses API Integration (stable core)", () => {
  jest.setTimeout(30000);

  beforeAll(async () => {
    await cleanDatabase();
  });

  it("lists created courses and supports code search", async () => {
    await createTestCourse({ code: "CENG331", name: "Computer Organization" });
    await createTestCourse({ code: "MATH119", name: "Calculus" });

    const listed = await prisma.course.findMany({ orderBy: { code: "asc" } });
    expect(listed.length).toBeGreaterThanOrEqual(2);

    const search = await prisma.course.findMany({
      where: {
        OR: [
          { code: { contains: "CENG", mode: "insensitive" } },
          { name: { contains: "CENG", mode: "insensitive" } },
        ],
      },
    });

    expect(search).toHaveLength(1);
    expect(search[0].code).toBe("CENG331");
  });

  it("returns course with approved review statistics", async () => {
    const user1 = await createTestUser({ email: "course-stats-1@metu.edu.tr" });
    const user2 = await createTestUser({ email: "course-stats-2@metu.edu.tr" });
    const course = await createTestCourse({ code: "CENG350", name: "Software Engineering" });
    const professor = await createTestProfessor();

    await createTestCourseReview(user1.id, course.id, professor.id, {
      semester: "2024-2025 Guz",
      overallRating: 4,
      status: "APPROVED",
    });

    await createTestCourseReview(user2.id, course.id, professor.id, {
      semester: "2023-2024 Bahar",
      overallRating: 5,
      status: "APPROVED",
    });

    const withStats = await prisma.course.findUnique({
      where: { id: course.id },
      include: {
        reviews: {
          where: { status: "APPROVED" },
          select: { overallRating: true },
        },
      },
    });

    expect(withStats).not.toBeNull();
    expect(withStats?.reviews).toHaveLength(2);

    const ratings = withStats?.reviews.map((r) => r.overallRating) ?? [];
    const average = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    expect(average).toBe(4.5);
  });

  it("finds course by exact code and returns null for unknown course", async () => {
    await createTestCourse({ code: "EE202", name: "Circuits" });

    const found = await prisma.course.findUnique({ where: { code: "EE202" } });
    const missing = await prisma.course.findUnique({ where: { code: "NOTEXIST999" } });

    expect(found?.code).toBe("EE202");
    expect(missing).toBeNull();
  });
});
