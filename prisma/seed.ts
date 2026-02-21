import { PrismaClient, Title, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import metuData from "../scripts/metu-data.json";
import academicsData from "../scripts/academics.json";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting ODTÜ Pusula database seeding...");
  console.log(`📊 Data to seed:
  - Departments: ${metuData.departments.length}
  - Courses: ${metuData.courses.length}
  - Academics: ${academicsData.length}
`);

  // Clear existing data (reviews first due to foreign keys)
  console.log("🗑️  Clearing existing data...");
  await prisma.courseReview.deleteMany({});
  await prisma.professorReview.deleteMany({});
  await prisma.courseProfessor.deleteMany({});
  await prisma.professor.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.department.deleteMany({});
  console.log("✅ Existing data cleared");

  // 1. Seed Departments
  console.log("🏢 Seeding Departments...");
  const deptMap = new Map<string, string>();

  for (const dept of metuData.departments) {
    const d = await prisma.department.create({
      data: {
        code: dept.code,
        name: dept.name,
        faculty: dept.faculty
      },
    });
    deptMap.set(dept.code, d.id);
  }
  console.log(`✅ ${metuData.departments.length} departments seeded`);

  // 2. Seed Courses
  console.log("📚 Seeding Courses...");
  const courseMap = new Map<string, string>();

  for (const course of metuData.courses) {
    const deptId = deptMap.get(course.departmentCode);
    if (!deptId) {
      console.warn(`⚠️  Department not found for course ${course.code}: ${course.departmentCode}`);
      continue;
    }

    try {
      const c = await prisma.course.create({
        data: {
          code: course.code,
          name: course.name,
          credits: course.credits,
          departmentId: deptId,
        },
      });
      courseMap.set(course.code, c.id);
    } catch (error) {
      console.error(`❌ Error seeding course ${course.code}:`, error);
    }
  }
  console.log(`✅ ${courseMap.size} courses seeded`);

  // 3. Seed Professors/Academics from real data
  console.log("👨‍🏫 Seeding Academics (Professors & Research Assistants)...");
  const profMap = new Map<string, string>();

  for (const academic of academicsData) {
    const deptId = deptMap.get(academic.departmentCode);
    if (!deptId) {
      // Skip if department not found
      continue;
    }

    try {
      const p = await prisma.professor.create({
        data: {
          name: academic.name,
          title: academic.title as Title,
          departmentId: deptId,
        },
      });
      profMap.set(academic.name, p.id);
    } catch {
      // Skip duplicates or errors
    }
  }
  console.log(`✅ ${profMap.size} academics seeded`);

  // 4. Create Course-Professor relationships
  console.log("🔗 Creating Course-Professor relationships...");
  let relationshipCount = 0;

  // Group academics by department
  const academicsByDept = new Map<string, typeof academicsData>();
  for (const academic of academicsData) {
    if (!academicsByDept.has(academic.departmentCode)) {
      academicsByDept.set(academic.departmentCode, []);
    }
    academicsByDept.get(academic.departmentCode)!.push(academic);
  }

  // Assign professors to courses
  for (const course of metuData.courses) {
    const courseId = courseMap.get(course.code);
    if (!courseId) continue;

    const deptAcademics = academicsByDept.get(course.departmentCode);
    if (!deptAcademics || deptAcademics.length === 0) continue;

    // Filter to get professors (not research assistants) for course assignment
    const profs = deptAcademics.filter(a =>
      a.title === 'PROF_DR' ||
      a.title === 'ASSOC_PROF_DR' ||
      a.title === 'ASST_PROF_DR' ||
      a.title === 'LECTURER'
    );

    if (profs.length === 0) continue;

    // Assign 1-2 professors randomly
    const numProfs = Math.min(profs.length, Math.floor(Math.random() * 2) + 1);
    const shuffled = profs.sort(() => 0.5 - Math.random());
    const selectedProfs = shuffled.slice(0, numProfs);

    for (const prof of selectedProfs) {
      const profId = profMap.get(prof.name);
      if (!profId) continue;

      try {
        await prisma.courseProfessor.create({
          data: {
            courseId,
            professorId: profId,
          },
        });
        relationshipCount++;
      } catch {
        // Ignore duplicate errors
      }
    }
  }
  console.log(`✅ ${relationshipCount} course-professor relationships created`);

  // 5. Create Admin User
  console.log("👤 Creating admin user...");
  const adminPassword = await bcrypt.hash("Admin123!", 12);

  await prisma.user.upsert({
    where: { email: "admin@metu.edu.tr" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@metu.edu.tr",
      password: adminPassword,
      role: Role.ADMIN,
      emailVerified: new Date(),
    },
  });
  console.log("✅ Admin user created (admin@metu.edu.tr / Admin123!)");

  // 6. Create Test User
  console.log("👤 Creating test user...");
  const testPassword = await bcrypt.hash("Test1234!", 12);
  const cengDeptId = deptMap.get("CENG");

  await prisma.user.upsert({
    where: { email: "test@metu.edu.tr" },
    update: {},
    create: {
      name: "Test User",
      email: "test@metu.edu.tr",
      password: testPassword,
      role: Role.USER,
      emailVerified: new Date(),
      departmentId: cengDeptId,
      year: "JUNIOR",
    },
  });
  console.log("✅ Test user created (test@metu.edu.tr / Test1234!)");

  console.log("\n🎉 Seeding completed successfully!");
  console.log(`
📊 Summary:
  - Departments: ${deptMap.size}
  - Courses: ${courseMap.size}
  - Academics: ${profMap.size}
  - Course-Professor Relations: ${relationshipCount}
  - Users: 2 (admin + test)
  - Reviews: 0 (clean slate - no fake reviews!)
`);
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
