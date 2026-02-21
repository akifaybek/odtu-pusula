import prisma from "@/lib/prisma";
import {
  cleanDatabase,
  createTestCourse,
  createTestCourseReview,
  createTestProfessor,
  createTestProfessorReview,
  createTestUser,
} from "../utils/test-helpers";

describe("Reviews API Integration (stable core)", () => {
  jest.setTimeout(30000);

  beforeAll(async () => {
    await cleanDatabase();
  });

  it("creates a course review and enforces unique (user+course+semester)", async () => {
    const user = await createTestUser();
    const course = await createTestCourse();
    const professor = await createTestProfessor();

    const created = await createTestCourseReview(user.id, course.id, professor.id, {
      semester: "2024-2025 Guz",
      overallRating: 4,
    });

    expect(created.id).toBeDefined();
    expect(created.overallRating).toBe(4);

    await expect(
      prisma.courseReview.create({
        data: {
          userId: user.id,
          courseId: course.id,
          professorId: professor.id,
          semester: "2024-2025 Guz",
          difficultyRating: 3,
          workloadRating: 3,
          usefulnessRating: 3,
          overallRating: 3,
          comment: "duplicate",
        },
      })
    ).rejects.toThrow();
  });

  it("creates a professor review", async () => {
    const user = await createTestUser();
    const course = await createTestCourse();
    const professor = await createTestProfessor();

    const review = await createTestProfessorReview(user.id, professor.id, course.id, {
      semester: "2024-2025 Guz",
      overallRating: 5,
      wouldTakeAgain: true,
    });

    expect(review.id).toBeDefined();
    expect(review.overallRating).toBe(5);
    expect(review.wouldTakeAgain).toBe(true);
  });

  it("supports like flow and prevents duplicate likes", async () => {
    const author = await createTestUser({ email: "author-core@metu.edu.tr" });
    const liker = await createTestUser({ email: "liker-core@metu.edu.tr" });
    const course = await createTestCourse();
    const professor = await createTestProfessor();

    const review = await createTestCourseReview(author.id, course.id, professor.id, {
      semester: "2023-2024 Bahar",
    });

    await prisma.reviewLike.create({
      data: {
        userId: liker.id,
        reviewId: review.id,
        reviewType: "course",
      },
    });

    await expect(
      prisma.reviewLike.create({
        data: {
          userId: liker.id,
          reviewId: review.id,
          reviewType: "course",
        },
      })
    ).rejects.toThrow();

    const likeCount = await prisma.reviewLike.count({ where: { reviewId: review.id } });
    expect(likeCount).toBe(1);
  });
});
