import { PrismaClient, Title, Year, Grade } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const departments = [
  { code: "CENG", name: "Bilgisayar Muhendisligi", faculty: "Muhendislik Fakultesi" },
  { code: "EE", name: "Elektrik-Elektronik Muhendisligi", faculty: "Muhendislik Fakultesi" },
  { code: "ME", name: "Makine Muhendisligi", faculty: "Muhendislik Fakultesi" },
  { code: "IE", name: "Endustri Muhendisligi", faculty: "Muhendislik Fakultesi" },
  { code: "CE", name: "Insaat Muhendisligi", faculty: "Muhendislik Fakultesi" },
  { code: "CHE", name: "Kimya Muhendisligi", faculty: "Muhendislik Fakultesi" },
  { code: "AERO", name: "Havacilik ve Uzay Muhendisligi", faculty: "Muhendislik Fakultesi" },
  { code: "MATH", name: "Matematik", faculty: "Fen Edebiyat Fakultesi" },
  { code: "PHYS", name: "Fizik", faculty: "Fen Edebiyat Fakultesi" },
  { code: "CHEM", name: "Kimya", faculty: "Fen Edebiyat Fakultesi" },
  { code: "STAT", name: "Istatistik", faculty: "Fen Edebiyat Fakultesi" },
  { code: "BIOL", name: "Biyoloji", faculty: "Fen Edebiyat Fakultesi" },
  { code: "BA", name: "Isletme", faculty: "Iktisadi ve Idari Bilimler Fakultesi" },
  { code: "ECON", name: "Ekonomi", faculty: "Iktisadi ve Idari Bilimler Fakultesi" },
  { code: "ARCH", name: "Mimarlik", faculty: "Mimarlik Fakultesi" },
  { code: "ID", name: "Endustriyel Tasarim", faculty: "Mimarlik Fakultesi" },
  { code: "PSY", name: "Psikoloji", faculty: "Fen Edebiyat Fakultesi" },
  { code: "SOC", name: "Sosyoloji", faculty: "Fen Edebiyat Fakultesi" },
];

const coursesData = [
  // CENG
  { code: "CENG140", name: "C Programming", credits: 4, deptCode: "CENG", description: "Introduction to programming using C language. Topics include data types, control structures, functions, arrays, pointers, and file operations." },
  { code: "CENG213", name: "Data Structures", credits: 4, deptCode: "CENG", description: "Fundamental data structures including arrays, linked lists, stacks, queues, trees, and graphs. Analysis of algorithms." },
  { code: "CENG232", name: "Logic Design", credits: 4, deptCode: "CENG", description: "Boolean algebra, combinational and sequential logic circuits, finite state machines." },
  { code: "CENG242", name: "Programming Language Concepts", credits: 3, deptCode: "CENG", description: "Syntax and semantics of programming languages, functional programming, type systems." },
  { code: "CENG331", name: "Computer Organization", credits: 4, deptCode: "CENG", description: "Computer architecture, assembly language, processor design, memory hierarchy." },
  { code: "CENG334", name: "Operating Systems", credits: 4, deptCode: "CENG", description: "Process management, memory management, file systems, concurrency." },
  { code: "CENG351", name: "Database Management Systems", credits: 4, deptCode: "CENG", description: "Relational databases, SQL, normalization, transaction management." },
  { code: "CENG435", name: "Computer Networks", credits: 3, deptCode: "CENG", description: "Network protocols, TCP/IP, routing, network security." },
  // MATH
  { code: "MATH119", name: "Calculus with Analytic Geometry", credits: 4, deptCode: "MATH", description: "Limits, derivatives, integrals, applications of calculus." },
  { code: "MATH120", name: "Calculus for Functions of Several Variables", credits: 4, deptCode: "MATH", description: "Multivariable calculus, partial derivatives, multiple integrals." },
  { code: "MATH219", name: "Introduction to Differential Equations", credits: 4, deptCode: "MATH", description: "First and second order differential equations, Laplace transforms." },
  { code: "MATH260", name: "Linear Algebra", credits: 4, deptCode: "MATH", description: "Matrices, vector spaces, linear transformations, eigenvalues." },
  // PHYS
  { code: "PHYS105", name: "General Physics I", credits: 4, deptCode: "PHYS", description: "Mechanics, thermodynamics, waves." },
  { code: "PHYS106", name: "General Physics II", credits: 4, deptCode: "PHYS", description: "Electricity, magnetism, optics." },
  // EE
  { code: "EE230", name: "Probability and Random Variables", credits: 3, deptCode: "EE", description: "Probability theory, random variables, distributions." },
  { code: "EE301", name: "Signals and Systems", credits: 4, deptCode: "EE", description: "Continuous and discrete signals, Fourier analysis, filtering." },
  { code: "EE361", name: "Electromechanical Energy Conversion", credits: 4, deptCode: "EE", description: "Transformers, electric machines, power systems." },
  // BA
  { code: "BA1101", name: "Introduction to Business", credits: 3, deptCode: "BA", description: "Fundamentals of business, management, marketing, finance." },
  { code: "BA3101", name: "Financial Management", credits: 3, deptCode: "BA", description: "Corporate finance, investment decisions, capital structure." },
  // ECON
  { code: "ECON101", name: "Principles of Economics I", credits: 3, deptCode: "ECON", description: "Microeconomics fundamentals." },
  { code: "ECON102", name: "Principles of Economics II", credits: 3, deptCode: "ECON", description: "Macroeconomics fundamentals." },
];

const professorsData = [
  // CENG
  { name: "Ahmet Yilmaz", title: Title.PROF_DR, deptCode: "CENG" },
  { name: "Mehmet Ozturk", title: Title.ASSOC_PROF_DR, deptCode: "CENG" },
  { name: "Ayse Kaya", title: Title.ASST_PROF_DR, deptCode: "CENG" },
  { name: "Elif Sahin", title: Title.LECTURER, deptCode: "CENG" },
  { name: "Can Demir", title: Title.RES_ASST, deptCode: "CENG" },
  // MATH
  { name: "Fatma Yildiz", title: Title.PROF_DR, deptCode: "MATH" },
  { name: "Ali Celik", title: Title.ASSOC_PROF_DR, deptCode: "MATH" },
  { name: "Hasan Arslan", title: Title.ASST_PROF_DR, deptCode: "MATH" },
  // PHYS
  { name: "Zeynep Koc", title: Title.PROF_DR, deptCode: "PHYS" },
  { name: "Kemal Ozdemir", title: Title.ASSOC_PROF_DR, deptCode: "PHYS" },
  // EE
  { name: "Burak Yildirim", title: Title.PROF_DR, deptCode: "EE" },
  { name: "Selin Aydin", title: Title.ASST_PROF_DR, deptCode: "EE" },
  // BA
  { name: "Deniz Korkmaz", title: Title.PROF_DR, deptCode: "BA" },
  // ECON
  { name: "Murat Aksoy", title: Title.ASSOC_PROF_DR, deptCode: "ECON" },
];

const courseProfessorLinks = [
  { courseCode: "CENG140", profName: "Ahmet Yilmaz" },
  { courseCode: "CENG140", profName: "Ayse Kaya" },
  { courseCode: "CENG213", profName: "Mehmet Ozturk" },
  { courseCode: "CENG232", profName: "Elif Sahin" },
  { courseCode: "CENG242", profName: "Ayse Kaya" },
  { courseCode: "CENG331", profName: "Ahmet Yilmaz" },
  { courseCode: "CENG334", profName: "Mehmet Ozturk" },
  { courseCode: "CENG351", profName: "Ayse Kaya" },
  { courseCode: "CENG435", profName: "Mehmet Ozturk" },
  { courseCode: "MATH119", profName: "Fatma Yildiz" },
  { courseCode: "MATH119", profName: "Ali Celik" },
  { courseCode: "MATH120", profName: "Fatma Yildiz" },
  { courseCode: "MATH219", profName: "Hasan Arslan" },
  { courseCode: "MATH260", profName: "Ali Celik" },
  { courseCode: "PHYS105", profName: "Zeynep Koc" },
  { courseCode: "PHYS106", profName: "Kemal Ozdemir" },
  { courseCode: "EE230", profName: "Burak Yildirim" },
  { courseCode: "EE301", profName: "Selin Aydin" },
];

const usersData = [
  { email: "test@metu.edu.tr", password: "password123", name: "Test Kullanici", year: Year.JUNIOR, deptCode: "CENG" },
  { email: "ahmet@metu.edu.tr", password: "password123", name: "Ahmet Ogrenci", year: Year.SOPHOMORE, deptCode: "CENG" },
  { email: "zeynep@metu.edu.tr", password: "password123", name: "Zeynep Yilmaz", year: Year.SENIOR, deptCode: "EE" },
  { email: "can@metu.edu.tr", password: "password123", name: "Can Aksoy", year: Year.FRESHMAN, deptCode: "MATH" },
  { email: "elif@metu.edu.tr", password: "password123", name: "Elif Demir", year: Year.MASTERS, deptCode: "CENG" },
];

const courseReviewsData = [
  {
    userEmail: "test@metu.edu.tr",
    courseCode: "CENG140",
    profName: "Ahmet Yilmaz",
    semester: "2024-2025 Guz",
    difficultyRating: 3,
    workloadRating: 4,
    usefulnessRating: 5,
    overallRating: 4,
    grade: Grade.BA,
    comment: "C programlama icin harika bir giris dersi. Ahmet hoca konulari cok iyi anlatiyor. Odevler biraz yogun ama ogretici.",
    isAnonymous: false,
    likes: 12,
  },
  {
    userEmail: "ahmet@metu.edu.tr",
    courseCode: "CENG140",
    profName: "Ayse Kaya",
    semester: "2024-2025 Guz",
    difficultyRating: 4,
    workloadRating: 4,
    usefulnessRating: 5,
    overallRating: 4,
    grade: Grade.BB,
    comment: "Zor ama cok faydali bir ders. Pointer konusu biraz kafa karistirici olabiliyor ama pratik yapinca oturuyor.",
    isAnonymous: true,
    likes: 8,
  },
  {
    userEmail: "zeynep@metu.edu.tr",
    courseCode: "CENG213",
    profName: "Mehmet Ozturk",
    semester: "2024-2025 Guz",
    difficultyRating: 4,
    workloadRating: 5,
    usefulnessRating: 5,
    overallRating: 4,
    grade: Grade.CB,
    comment: "Data structures ogrenmek icin mukemmel. Odevler cok zaman aliyor ama sonunda algoritma dusunce yapisini kazaniyorsunuz.",
    isAnonymous: false,
    likes: 15,
  },
  {
    userEmail: "test@metu.edu.tr",
    courseCode: "MATH119",
    profName: "Fatma Yildiz",
    semester: "2023-2024 Bahar",
    difficultyRating: 4,
    workloadRating: 3,
    usefulnessRating: 4,
    overallRating: 4,
    grade: Grade.BB,
    comment: "Kalkulus zor bir ders ama Fatma hoca cok sabırlı. Bol bol soru cozmek lazim.",
    isAnonymous: false,
    likes: 6,
  },
  {
    userEmail: "can@metu.edu.tr",
    courseCode: "MATH119",
    profName: "Ali Celik",
    semester: "2024-2025 Guz",
    difficultyRating: 5,
    workloadRating: 4,
    usefulnessRating: 4,
    overallRating: 3,
    grade: Grade.CC,
    comment: "Ders zordu, sinavlar beklenenden farkli geldi. Ekstra kaynak kullanmak gerekiyor.",
    isAnonymous: true,
    likes: 3,
  },
  {
    userEmail: "elif@metu.edu.tr",
    courseCode: "CENG331",
    profName: "Ahmet Yilmaz",
    semester: "2024-2025 Guz",
    difficultyRating: 5,
    workloadRating: 5,
    usefulnessRating: 5,
    overallRating: 5,
    grade: Grade.AA,
    comment: "CENG'in en zor derslerinden biri ama en faydalisi. Assembly ve cache konulari cok onemli.",
    isAnonymous: false,
    likes: 22,
  },
  {
    userEmail: "test@metu.edu.tr",
    courseCode: "PHYS105",
    profName: "Zeynep Koc",
    semester: "2023-2024 Guz",
    difficultyRating: 3,
    workloadRating: 3,
    usefulnessRating: 3,
    overallRating: 3,
    grade: Grade.CB,
    comment: "Standart fizik dersi. Lise fiziginden farkli degil aslinda, sadece daha detayli.",
    isAnonymous: true,
    likes: 2,
  },
];

const professorReviewsData = [
  {
    userEmail: "test@metu.edu.tr",
    profName: "Ahmet Yilmaz",
    courseCode: "CENG140",
    semester: "2024-2025 Guz",
    teachingRating: 5,
    gradingRating: 4,
    accessRating: 4,
    overallRating: 5,
    comment: "Ahmet hoca alaninda uzman ve anlatimi cok iyi. Office hours'a mutlaka gidin, cok yardimci oluyor.",
    isAnonymous: false,
    wouldTakeAgain: true,
    likes: 18,
  },
  {
    userEmail: "ahmet@metu.edu.tr",
    profName: "Mehmet Ozturk",
    courseCode: "CENG213",
    semester: "2024-2025 Guz",
    teachingRating: 4,
    gradingRating: 3,
    accessRating: 5,
    overallRating: 4,
    comment: "Mehmet hoca ogrencilere cok yaklasiyor. Notlandirma biraz sert ama adil.",
    isAnonymous: false,
    wouldTakeAgain: true,
    likes: 11,
  },
  {
    userEmail: "zeynep@metu.edu.tr",
    profName: "Fatma Yildiz",
    courseCode: "MATH119",
    semester: "2023-2024 Bahar",
    teachingRating: 5,
    gradingRating: 5,
    accessRating: 3,
    overallRating: 4,
    comment: "Fatma hoca matematikte cok iyi ama ulasmak biraz zor. Ders saatleri disinda mail ile iletisim kurmak lazim.",
    isAnonymous: true,
    wouldTakeAgain: true,
    likes: 7,
  },
  {
    userEmail: "can@metu.edu.tr",
    profName: "Ali Celik",
    courseCode: "MATH119",
    semester: "2024-2025 Guz",
    teachingRating: 3,
    gradingRating: 2,
    accessRating: 2,
    overallRating: 2,
    comment: "Hoca iyi biri ama ders anlatimi biraz hizli. Sinavlar cok zor ve partial credit yok.",
    isAnonymous: true,
    wouldTakeAgain: false,
    likes: 4,
  },
  {
    userEmail: "elif@metu.edu.tr",
    profName: "Ahmet Yilmaz",
    courseCode: "CENG331",
    semester: "2024-2025 Guz",
    teachingRating: 5,
    gradingRating: 4,
    accessRating: 5,
    overallRating: 5,
    comment: "En iyi CENG hocalarindan. Ders zor ama hoca sayesinde cok sey ogreniyorsunuz.",
    isAnonymous: false,
    wouldTakeAgain: true,
    likes: 25,
  },
];

async function main() {
  console.log("Seeding database...\n");

  // 1. Bolumleri olustur
  console.log("Creating departments...");
  for (const dept of departments) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: {},
      create: dept,
    });
  }
  console.log(`Created ${departments.length} departments\n`);

  // Bolum ID'lerini al
  const deptMap = new Map<string, string>();
  const allDepts = await prisma.department.findMany();
  allDepts.forEach((d) => deptMap.set(d.code, d.id));

  // 2. Dersleri olustur
  console.log("Creating courses...");
  for (const course of coursesData) {
    const deptId = deptMap.get(course.deptCode);
    if (!deptId) continue;
    await prisma.course.upsert({
      where: { code: course.code },
      update: {},
      create: {
        code: course.code,
        name: course.name,
        credits: course.credits,
        description: course.description,
        departmentId: deptId,
      },
    });
  }
  console.log(`Created ${coursesData.length} courses\n`);

  // 3. Hocalari olustur
  console.log("Creating professors...");
  for (const prof of professorsData) {
    const deptId = deptMap.get(prof.deptCode);
    if (!deptId) continue;
    const existing = await prisma.professor.findFirst({
      where: { name: prof.name, departmentId: deptId },
    });
    if (!existing) {
      await prisma.professor.create({
        data: {
          name: prof.name,
          title: prof.title,
          departmentId: deptId,
        },
      });
    }
  }
  console.log(`Created ${professorsData.length} professors\n`);

  // 4. Ders-Hoca iliskilerini olustur
  console.log("Creating course-professor relations...");
  for (const link of courseProfessorLinks) {
    const course = await prisma.course.findUnique({ where: { code: link.courseCode } });
    const prof = await prisma.professor.findFirst({ where: { name: link.profName } });
    if (course && prof) {
      await prisma.courseProfessor.upsert({
        where: { courseId_professorId: { courseId: course.id, professorId: prof.id } },
        update: {},
        create: { courseId: course.id, professorId: prof.id },
      });
    }
  }
  console.log(`Created ${courseProfessorLinks.length} course-professor relations\n`);

  // 5. Kullanicilari olustur
  console.log("Creating users...");
  for (const user of usersData) {
    const deptId = deptMap.get(user.deptCode);
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        password: hashedPassword,
        name: user.name,
        year: user.year,
        departmentId: deptId || null,
      },
    });
  }
  console.log(`Created ${usersData.length} users\n`);

  // 6. Ders degerlendirmelerini olustur
  console.log("Creating course reviews...");
  for (const review of courseReviewsData) {
    const user = await prisma.user.findUnique({ where: { email: review.userEmail } });
    const course = await prisma.course.findUnique({ where: { code: review.courseCode } });
    const prof = await prisma.professor.findFirst({ where: { name: review.profName } });

    if (user && course) {
      const existing = await prisma.courseReview.findUnique({
        where: {
          userId_courseId_semester: {
            userId: user.id,
            courseId: course.id,
            semester: review.semester,
          },
        },
      });

      if (!existing) {
        await prisma.courseReview.create({
          data: {
            userId: user.id,
            courseId: course.id,
            professorId: prof?.id || null,
            semester: review.semester,
            difficultyRating: review.difficultyRating,
            workloadRating: review.workloadRating,
            usefulnessRating: review.usefulnessRating,
            overallRating: review.overallRating,
            grade: review.grade,
            comment: review.comment,
            isAnonymous: review.isAnonymous,
            likes: review.likes,
          },
        });
      }
    }
  }
  console.log(`Created ${courseReviewsData.length} course reviews\n`);

  // 7. Hoca degerlendirmelerini olustur
  console.log("Creating professor reviews...");
  for (const review of professorReviewsData) {
    const user = await prisma.user.findUnique({ where: { email: review.userEmail } });
    const prof = await prisma.professor.findFirst({ where: { name: review.profName } });
    const course = review.courseCode
      ? await prisma.course.findUnique({ where: { code: review.courseCode } })
      : null;

    if (user && prof) {
      const existing = await prisma.professorReview.findUnique({
        where: {
          userId_professorId_semester: {
            userId: user.id,
            professorId: prof.id,
            semester: review.semester,
          },
        },
      });

      if (!existing) {
        await prisma.professorReview.create({
          data: {
            userId: user.id,
            professorId: prof.id,
            courseId: course?.id || null,
            semester: review.semester,
            teachingRating: review.teachingRating,
            gradingRating: review.gradingRating,
            accessRating: review.accessRating,
            overallRating: review.overallRating,
            comment: review.comment,
            isAnonymous: review.isAnonymous,
            wouldTakeAgain: review.wouldTakeAgain,
            likes: review.likes,
          },
        });
      }
    }
  }
  console.log(`Created ${professorReviewsData.length} professor reviews\n`);

  console.log("Seeding completed successfully!");
  console.log("\nTest account: test@metu.edu.tr / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
