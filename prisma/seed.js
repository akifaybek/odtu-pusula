"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// prisma/seed.ts
import { PrismaClient, Title, Role, ReviewStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
var prisma = new PrismaClient();
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function getRandomElements(arr, count) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
function getRandomBoolean() {
  return Math.random() > 0.5;
}
var firstNames = ["Ali", "Veli", "Ayse", "Fatma", "Ahmet", "Mehmet", "Zeynep", "Elif", "Can", "Mert", "Deniz", "Burak", "Selin", "Gizem"];
var lastNames = ["Yilmaz", "Kaya", "Demir", "Celik", "Sahin", "Yildiz", "Ozturk", "Aydin", "Ozdemir", "Arslan", "Dogan", "Koc"];
function getRandomName() {
  const first = getRandomElement(firstNames);
  const last = getRandomElement(lastNames);
  return `${first} ${last}`;
}
function getRandomEmail(name) {
  const parts = name.toLowerCase().replace(/[^a-z]/g, "").split(" ");
  const first = parts[0] || "user";
  const last = parts[1] || "last";
  const date = Date.now().toString().slice(-4);
  return `${first}.${last}${date}@metu.edu.tr`;
}
function getRandomSentence() {
  const sentences = [
    "This was a great course.",
    "I learned a lot from this professor.",
    "Very challenging but rewarding.",
    "Would recommendation to everyone.",
    "The exams were quite difficult.",
    "Not satisfied with the grading.",
    "Excellent teaching style.",
    "Could be better organized.",
    "Textbook was not necessary.",
    "Attend the lectures!"
  ];
  return getRandomElement(sentences);
}
var departmentsData = [
  // Engineering
  { code: "CENG", name: "Computer Engineering", faculty: "Faculty of Engineering" },
  { code: "EE", name: "Electrical and Electronics Engineering", faculty: "Faculty of Engineering" },
  { code: "IE", name: "Industrial Engineering", faculty: "Faculty of Engineering" },
  { code: "ME", name: "Mechanical Engineering", faculty: "Faculty of Engineering" },
  // Adding others as per request example, keeping it focused on the main request
  { code: "ARCH", name: "Architecture", faculty: "Faculty of Architecture" },
  { code: "ECON", name: "Economics", faculty: "Faculty of Economics and Administrative Sciences" },
  { code: "PHYS", name: "Physics", faculty: "Faculty of Arts and Sciences" }
];
var courseCodes = {
  CENG: ["CENG111", "CENG140", "CENG213", "CENG223", "CENG315", "CENG334", "CENG435"],
  EE: ["EE201", "EE202", "EE230", "EE301", "EE311"],
  IE: ["IE251", "IE265", "IE323", "IE371", "IE403"],
  ME: ["ME105", "ME203", "ME205", "ME305", "ME311"],
  ARCH: ["ARCH101", "ARCH102", "ARCH201", "ARCH301", "ARCH401"],
  ECON: ["ECON101", "ECON102", "ECON201", "ECON311", "ECON401"],
  PHYS: ["PHYS105", "PHYS106", "PHYS111", "PHYS221", "PHYS300"]
};
async function main() {
  console.log("\u{1F331} Starting seeding...");
  console.log("\u{1F9F9} (Skipped) strict cleanup. Using upserts.");
  console.log("\u{1F3E2} Seeding Departments...");
  const deptMap = /* @__PURE__ */ new Map();
  for (const dept of departmentsData) {
    const d = await prisma.department.upsert({
      where: { code: dept.code },
      update: { name: dept.name, faculty: dept.faculty },
      create: dept
    });
    deptMap.set(d.code, d.id);
  }
  console.log("\u{1F468}\u200D\u{1F3EB} Seeding Professors...");
  const professorsConfig = [
    { title: Title.PROF_DR, count: 5 },
    { title: Title.ASSOC_PROF_DR, count: 4 },
    { title: Title.ASST_PROF_DR, count: 4 },
    { title: Title.LECTURER, count: 3 }
  ];
  const createdProfIds = [];
  for (const conf of professorsConfig) {
    for (let i = 0; i < conf.count; i++) {
      const deptCode = getRandomElement(departmentsData).code;
      const deptId = deptMap.get(deptCode);
      const name = getRandomName();
      const prof = await prisma.professor.create({
        data: {
          name,
          title: conf.title,
          departmentId: deptId,
          email: getRandomEmail(name)
          // image: null, // Skip image or use a static one
        }
      });
      createdProfIds.push(prof.id);
    }
  }
  console.log("\u{1F4DA} Seeding Courses...");
  const createdCourseIds = [];
  for (const [deptCode, codes] of Object.entries(courseCodes)) {
    const deptId = deptMap.get(deptCode);
    if (!deptId) continue;
    for (const code of codes) {
      const course = await prisma.course.upsert({
        where: { code },
        update: {},
        create: {
          code,
          name: `${code} Course Name`,
          credits: getRandomElement([3, 4]),
          departmentId: deptId,
          description: getRandomSentence()
        }
      });
      createdCourseIds.push(course.id);
      const randomProfs = getRandomElements(createdProfIds, getRandomInt(1, 2));
      for (const profId of randomProfs) {
        await prisma.courseProfessor.upsert({
          where: { courseId_professorId: { courseId: course.id, professorId: profId } },
          update: {},
          create: { courseId: course.id, professorId: profId }
        });
      }
    }
  }
  console.log("\u{1F465} Seeding Users...");
  const hashedPassword = await bcrypt.hash("password123", 10);
  const createdUserIds = [];
  for (let i = 0; i < 20; i++) {
    const name = getRandomName();
    const email = getRandomEmail(name);
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name,
        password: hashedPassword,
        departmentId: deptMap.get(getRandomElement(departmentsData).code),
        // Fix: Year enum values are strings in Prisma Client
        year: getRandomElement(["FRESHMAN", "SOPHOMORE", "JUNIOR", "SENIOR"]),
        role: Role.USER,
        emailVerified: /* @__PURE__ */ new Date()
        // image: null,
      }
    });
    createdUserIds.push(user.id);
  }
  console.log("\u2B50 Seeding Reviews...");
  for (let i = 0; i < 30; i++) {
    const userId = getRandomElement(createdUserIds);
    const courseId = getRandomElement(createdCourseIds);
    const relation = await prisma.courseProfessor.findFirst({ where: { courseId } });
    const professorId = relation?.professorId;
    try {
      await prisma.courseReview.create({
        data: {
          userId,
          courseId,
          professorId,
          semester: getRandomElement(["2023-2024 Fall", "2023-2024 Spring", "2024-2025 Fall"]),
          difficultyRating: getRandomInt(1, 5),
          workloadRating: getRandomInt(1, 5),
          usefulnessRating: getRandomInt(1, 5),
          overallRating: getRandomInt(1, 5),
          grade: getRandomElement(["AA", "BA", "BB", "CB", "CC", "DC", "DD", "FD", "FF"]),
          comment: getRandomSentence(),
          isAnonymous: getRandomBoolean(),
          status: ReviewStatus.APPROVED,
          likes: getRandomInt(0, 20)
        }
      });
    } catch {
    }
  }
  for (let i = 0; i < 20; i++) {
    const userId = getRandomElement(createdUserIds);
    const professorId = getRandomElement(createdProfIds);
    try {
      await prisma.professorReview.create({
        data: {
          userId,
          professorId,
          semester: getRandomElement(["2023-2024 Fall", "2023-2024 Spring"]),
          teachingRating: getRandomInt(1, 5),
          gradingRating: getRandomInt(1, 5),
          accessRating: getRandomInt(1, 5),
          overallRating: getRandomInt(1, 5),
          comment: getRandomSentence(),
          isAnonymous: getRandomBoolean(),
          status: ReviewStatus.APPROVED,
          wouldTakeAgain: getRandomBoolean(),
          likes: getRandomInt(0, 20)
        }
      });
    } catch {
    }
  }
  console.log("\u2705 Seeding completed!");
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
