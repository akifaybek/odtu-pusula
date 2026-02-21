import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Geçici seed endpoint - veriyi DB'ye yüklemek için bir kez kullanılır
// Kullanım: GET /api/admin/seed?secret=odtu-pusula-seed-2024
// Kullandıktan sonra bu dosyayı silin!

const SEED_SECRET = "odtu-pusula-seed-2024";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const metuData = require("../../../../../scripts/metu-data.json");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const academicsData = require("../../../../../scripts/academics.json");

type Academic = {
  name: string;
  title: string;
  departmentCode: string;
  email?: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = {
    departments: 0,
    courses: 0,
    professors: 0,
    relations: 0,
    errors: [] as string[],
  };

  try {
    // 1. Departments
    console.log("🏢 Seeding departments...");
    const deptMap = new Map<string, string>();

    for (const dept of metuData.departments) {
      try {
        const d = await prisma.department.upsert({
          where: { code: dept.code },
          update: { name: dept.name, faculty: dept.faculty },
          create: { code: dept.code, name: dept.name, faculty: dept.faculty },
        });
        deptMap.set(dept.code, d.id);
        results.departments++;
      } catch (e) {
        results.errors.push(`Dept ${dept.code}: ${e}`);
      }
    }

    // 2. Courses
    console.log("📚 Seeding courses...");
    const courseMap = new Map<string, { id: string; departmentCode: string }>();

    for (const course of metuData.courses) {
      const deptId = deptMap.get(course.departmentCode);
      if (!deptId) continue;

      try {
        const c = await prisma.course.upsert({
          where: { code: course.code },
          update: { name: course.name },
          create: {
            code: course.code,
            name: course.name,
            credits: course.credits || 3,
            departmentId: deptId,
            description: course.description || null,
          },
        });
        courseMap.set(course.code, { id: c.id, departmentCode: course.departmentCode });
        results.courses++;
      } catch (e) {
        results.errors.push(`Course ${course.code}: ${e}`);
      }
    }

    // 3. Professors
    console.log("👨‍🏫 Seeding professors...");
    const validTitles = new Set(["PROF_DR", "ASSOC_PROF_DR", "ASST_PROF_DR", "LECTURER", "RES_ASST"]);
    const profMap = new Map<string, { id: string; departmentCode: string; title: string }>();

    for (const academic of academicsData as Academic[]) {
      const deptId = deptMap.get(academic.departmentCode);
      if (!deptId || !validTitles.has(academic.title)) continue;

      try {
        const p = await prisma.professor.create({
          data: {
            name: academic.name,
            title: academic.title as "PROF_DR" | "ASSOC_PROF_DR" | "ASST_PROF_DR" | "LECTURER" | "RES_ASST",
            departmentId: deptId,
            email: academic.email || null,
          },
        });
        profMap.set(academic.name, { id: p.id, departmentCode: academic.departmentCode, title: academic.title });
        results.professors++;
      } catch {
        // Skip duplicates
      }
    }

    // 4. Course-Professor ilişkileri
    console.log("🔗 Creating relations...");
    const seniorTitles = new Set(["PROF_DR", "ASSOC_PROF_DR", "ASST_PROF_DR", "LECTURER"]);
    const profsByDept = new Map<string, Array<{ id: string; name: string; title: string }>>();

    for (const [name, prof] of profMap.entries()) {
      if (!profsByDept.has(prof.departmentCode)) profsByDept.set(prof.departmentCode, []);
      profsByDept.get(prof.departmentCode)!.push({ id: prof.id, name, title: prof.title });
    }

    for (const [courseCode, course] of courseMap.entries()) {
      const deptProfs = (profsByDept.get(course.departmentCode) || []).filter(p => seniorTitles.has(p.title));
      if (deptProfs.length === 0) continue;

      const hash = courseCode.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
      const numProfs = Math.min((hash % 2) + 1, deptProfs.length);

      for (let i = 0; i < numProfs; i++) {
        const prof = deptProfs[(hash + i) % deptProfs.length];
        try {
          await prisma.courseProfessor.create({
            data: { courseId: course.id, professorId: prof.id },
          });
          results.relations++;
        } catch {
          // Skip duplicates
        }
      }
    }

    console.log("✅ Seeding done!", results);

    return NextResponse.json({
      success: true,
      message: "Veritabanı başarıyla dolduruldu!",
      results,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Seed hatası", details: String(error), partialResults: results },
      { status: 500 }
    );
  }
}
