import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

const TEST_DEPARTMENT_CODE = "TESTDEPT";
let uniqueCounter = 0;
let cachedTestDepartmentId: string | null = null;

function nextUniqueSuffix() {
  uniqueCounter += 1;
  return `${Date.now()}-${uniqueCounter}`;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withDbRetry<T>(operation: () => Promise<T>, retries = 4): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      const isPoolSaturation =
        message.includes("MaxClientsInSessionMode") ||
        message.includes("max clients reached") ||
        message.includes("too many clients");

      if (!isPoolSaturation || attempt === retries) {
        throw error;
      }

      await sleep(100 * (attempt + 1));
    }
  }

  throw lastError instanceof Error ? lastError : new Error("DB retry failed");
}

async function getOrCreateTestDepartment() {
  if (cachedTestDepartmentId) {
    return {
      id: cachedTestDepartmentId,
      code: TEST_DEPARTMENT_CODE,
    };
  }

  const department = await prisma.department.upsert({
    where: { code: TEST_DEPARTMENT_CODE },
    update: {},
    create: {
      code: TEST_DEPARTMENT_CODE,
      name: "Test Department",
      faculty: "Test Faculty",
    },
  });

  cachedTestDepartmentId = department.id;
  return department;
}

/**
 * Test veritabanını temizler.
 * Her test öncesi çağrılmalı.
 */
export async function cleanDatabase() {
  await withDbRetry(async () => {
    // Çok sayıda deleteMany yerine tek TRUNCATE ile daha hızlı ve deterministik reset.
    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE
        "ReviewLike",
        "Report",
        "CourseReview",
        "ProfessorReview",
        "PasswordResetToken",
        "EmailVerificationToken",
        "Session",
        "Account",
        "CourseProfessor",
        "Course",
        "Professor",
        "User"
      RESTART IDENTITY CASCADE;
    `);

    // Department seed'e bağımlılığı azaltmak için test departmanını garanti et.
    const dept = await getOrCreateTestDepartment();
    cachedTestDepartmentId = dept.id;
  });
}

/**
 * Test kullanıcısı oluşturur.
 */
export async function createTestUser(overrides: Partial<{
  email: string;
  name: string;
  password: string;
  emailVerified: Date | null;
  role: "USER" | "MODERATOR" | "ADMIN";
  isBanned: boolean;
}> = {}) {
  const hashedPassword = await bcrypt.hash(overrides.password || "Test123!", 10);
  const uniqueSuffix = nextUniqueSuffix();

  return withDbRetry(() =>
    prisma.user.create({
      data: {
        email: overrides.email || `test-${uniqueSuffix}@metu.edu.tr`,
        name: overrides.name || "Test User",
        password: hashedPassword,
        emailVerified: overrides.emailVerified !== undefined ? overrides.emailVerified : new Date(),
        role: overrides.role || "USER",
        isBanned: overrides.isBanned || false,
      },
    })
  );
}

/**
 * Test dersi oluşturur.
 */
export async function createTestCourse(overrides: Partial<{
  code: string;
  name: string;
  credits: number;
  departmentId: string;
}> = {}) {
  // Departman yoksa test departmanını oluştur/kullan.
  let departmentId = overrides.departmentId;
  if (!departmentId) {
    const dept = await getOrCreateTestDepartment();
    departmentId = dept.id;
  }

  const uniqueSuffix = nextUniqueSuffix();

  return withDbRetry(() =>
    prisma.course.create({
      data: {
        code: overrides.code || `TEST${uniqueSuffix}`,
        name: overrides.name || "Test Course",
        credits: overrides.credits || 3,
        departmentId,
      },
    })
  );
}

/**
 * Test hocası oluşturur.
 */
export async function createTestProfessor(overrides: Partial<{
  name: string;
  title: "PROF_DR" | "ASSOC_PROF_DR" | "ASST_PROF_DR" | "LECTURER" | "RES_ASST";
  departmentId: string;
  email: string;
}> = {}) {
  let departmentId = overrides.departmentId;
  if (!departmentId) {
    const dept = await getOrCreateTestDepartment();
    departmentId = dept.id;
  }

  return withDbRetry(() =>
    prisma.professor.create({
      data: {
        name: overrides.name || "Test Professor",
        title: overrides.title || "PROF_DR",
        departmentId,
        email: overrides.email,
      },
    })
  );
}

/**
 * Test ders değerlendirmesi oluşturur.
 */
export async function createTestCourseReview(
  userId: string,
  courseId: string,
  professorId: string,
  overrides: Partial<{
    semester: string;
    difficultyRating: number;
    workloadRating: number;
    usefulnessRating: number;
    overallRating: number;
    comment: string;
    isAnonymous: boolean;
    status: "PENDING" | "APPROVED" | "REJECTED";
  }> = {}
) {
  return withDbRetry(() =>
    prisma.courseReview.create({
      data: {
        userId,
        courseId,
        professorId,
        semester: overrides.semester || "2024-2025 Guz",
        difficultyRating: overrides.difficultyRating || 3,
        workloadRating: overrides.workloadRating || 3,
        usefulnessRating: overrides.usefulnessRating || 4,
        overallRating: overrides.overallRating || 4,
        comment: overrides.comment || "Bu ders gerçekten çok faydalıydı. Öğretici ve kapsamlı bir içeriğe sahip.",
        isAnonymous: overrides.isAnonymous !== undefined ? overrides.isAnonymous : true,
        status: overrides.status || "APPROVED",
      },
    })
  );
}

/**
 * Test hoca değerlendirmesi oluşturur.
 */
export async function createTestProfessorReview(
  userId: string,
  professorId: string,
  courseId: string,
  overrides: Partial<{
    semester: string;
    teachingRating: number;
    gradingRating: number;
    accessRating: number;
    overallRating: number;
    wouldTakeAgain: boolean;
    comment: string;
    isAnonymous: boolean;
    status: "PENDING" | "APPROVED" | "REJECTED";
  }> = {}
) {
  return withDbRetry(() =>
    prisma.professorReview.create({
      data: {
        userId,
        professorId,
        courseId,
        semester: overrides.semester || "2024-2025 Guz",
        teachingRating: overrides.teachingRating || 4,
        gradingRating: overrides.gradingRating || 3,
        accessRating: overrides.accessRating || 4,
        overallRating: overrides.overallRating || 4,
        wouldTakeAgain: overrides.wouldTakeAgain !== undefined ? overrides.wouldTakeAgain : true,
        comment: overrides.comment || "Çok iyi bir hoca. Dersleri anlaşılır ve öğrencilere yardımcı oluyor.",
        isAnonymous: overrides.isAnonymous !== undefined ? overrides.isAnonymous : true,
        status: overrides.status || "APPROVED",
      },
    })
  );
}

/**
 * Mock session oluşturur.
 */
export function mockSession(userId: string, overrides: Partial<{
  email: string;
  name: string;
  role: string;
  emailVerified: boolean;
}> = {}) {
  return {
    user: {
      id: userId,
      email: overrides.email || "test@metu.edu.tr",
      name: overrides.name || "Test User",
      role: overrides.role || "USER",
      emailVerified: overrides.emailVerified !== undefined ? overrides.emailVerified : true,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}
