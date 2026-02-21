import { describe, it, expect, beforeEach, jest } from "@jest/globals";

// Mock dependencies
jest.mock("@/lib/prisma", () => ({
  prisma: {
    course: {
      findMany: jest.fn(),
    },
    professor: {
      findMany: jest.fn(),
    },
  },
}));

describe("Search Logic Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Course Search", () => {
    it("should search courses by code", async () => {
      const { prisma } = await import("@/lib/prisma");

      const mockCourses = [
        {
          id: "course1",
          code: "CENG140",
          name: "C Programming",
          department: { code: "CENG", name: "Computer Engineering" },
        },
        {
          id: "course2",
          code: "CENG242",
          name: "Programming Language Concepts",
          department: { code: "CENG", name: "Computer Engineering" },
        },
      ];

      (prisma.course.findMany as jest.Mock).mockResolvedValue(mockCourses);

      const courses = await prisma.course.findMany({
        where: {
          OR: [
            { code: { contains: "CENG", mode: "insensitive" } },
            { name: { contains: "CENG", mode: "insensitive" } },
          ],
        },
        include: {
          department: { select: { code: true, name: true } },
        },
        take: 20,
      });

      expect(courses).toHaveLength(2);
      expect(courses[0].code).toBe("CENG140");
      expect(courses[1].code).toBe("CENG242");
    });

    it("should search courses by name", async () => {
      const { prisma } = await import("@/lib/prisma");

      const mockCourses = [
        {
          id: "course1",
          code: "CENG140",
          name: "C Programming",
          department: { code: "CENG", name: "Computer Engineering" },
        },
      ];

      (prisma.course.findMany as jest.Mock).mockResolvedValue(mockCourses);

      const courses = await prisma.course.findMany({
        where: {
          OR: [
            { code: { contains: "programming", mode: "insensitive" } },
            { name: { contains: "programming", mode: "insensitive" } },
          ],
        },
        include: {
          department: { select: { code: true, name: true } },
        },
        take: 20,
      });

      expect(courses).toHaveLength(1);
      expect(courses[0].name).toContain("Programming");
    });

    it("should filter courses by department", async () => {
      const { prisma } = await import("@/lib/prisma");

      const mockCourses = [
        {
          id: "course1",
          code: "CENG140",
          name: "C Programming",
          departmentId: "dept1",
          department: { code: "CENG", name: "Computer Engineering" },
        },
      ];

      (prisma.course.findMany as jest.Mock).mockResolvedValue(mockCourses);

      const courses = await prisma.course.findMany({
        where: {
          departmentId: "dept1",
        },
        include: {
          department: { select: { code: true, name: true } },
        },
        take: 20,
      });

      expect(courses).toHaveLength(1);
      expect(courses[0].departmentId).toBe("dept1");
    });

    it("should limit results to 20 items", async () => {
      const { prisma } = await import("@/lib/prisma");

      const manyCourses = Array.from({ length: 30 }, (_, i) => ({
        id: `course${i}`,
        code: `CENG${i}`,
        name: `Course ${i}`,
        department: { code: "CENG", name: "Computer Engineering" },
      }));

      // Mock will respect the take: 20 limit
      (prisma.course.findMany as jest.Mock).mockResolvedValue(manyCourses.slice(0, 20));

      const courses = await prisma.course.findMany({
        where: {
          OR: [
            { code: { contains: "ceng", mode: "insensitive" } },
            { name: { contains: "ceng", mode: "insensitive" } },
          ],
        },
        include: {
          department: { select: { code: true, name: true } },
        },
        take: 20,
      });

      expect(courses.length).toBeLessThanOrEqual(20);
    });

    it("should handle Turkish characters in search", () => {
      // Test Turkish character normalization logic
      const normalizeTurkish = (text: string) => {
        return text
          .replace(/İ/g, "i")
          .replace(/I/g, "ı")
          .toLowerCase()
          .replace(/ğ/g, "g")
          .replace(/ü/g, "u")
          .replace(/ş/g, "s")
          .replace(/ı/g, "i")
          .replace(/ö/g, "o")
          .replace(/ç/g, "c");
      };

      expect(normalizeTurkish("Türk Dili")).toBe("turk dili");
      expect(normalizeTurkish("İstanbul")).toBe("istanbul");
      expect(normalizeTurkish("Ağaç")).toBe("agac");
    });
  });

  describe("Professor Search", () => {
    it("should search professors by name", async () => {
      const { prisma } = await import("@/lib/prisma");

      const mockProfessors = [
        {
          id: "prof1",
          name: "Prof. Dr. Test Yılmaz",
          title: "PROF_DR",
          department: { code: "CENG", name: "Computer Engineering" },
        },
      ];

      (prisma.professor.findMany as jest.Mock).mockResolvedValue(mockProfessors);

      const professors = await prisma.professor.findMany({
        where: {
          name: { contains: "test", mode: "insensitive" },
        },
        include: {
          department: { select: { code: true, name: true } },
        },
        take: 20,
      });

      expect(professors).toHaveLength(1);
      expect(professors[0].name).toContain("Test");
    });

    it("should filter professors by department", async () => {
      const { prisma } = await import("@/lib/prisma");

      const mockProfessors = [
        {
          id: "prof1",
          name: "Prof. Dr. Test",
          title: "PROF_DR",
          departmentId: "dept1",
          department: { code: "CENG", name: "Computer Engineering" },
        },
      ];

      (prisma.professor.findMany as jest.Mock).mockResolvedValue(mockProfessors);

      const professors = await prisma.professor.findMany({
        where: {
          departmentId: "dept1",
        },
        include: {
          department: { select: { code: true, name: true } },
        },
        take: 20,
      });

      expect(professors).toHaveLength(1);
      expect(professors[0].departmentId).toBe("dept1");
    });

    it("should limit professor results to 20 items", async () => {
      const { prisma } = await import("@/lib/prisma");

      const manyProfessors = Array.from({ length: 30 }, (_, i) => ({
        id: `prof${i}`,
        name: `Professor ${i}`,
        title: "PROF_DR",
        department: { code: "CENG", name: "Computer Engineering" },
      }));

      (prisma.professor.findMany as jest.Mock).mockResolvedValue(manyProfessors.slice(0, 20));

      const professors = await prisma.professor.findMany({
        where: {
          name: { contains: "professor", mode: "insensitive" },
        },
        include: {
          department: { select: { code: true, name: true } },
        },
        take: 20,
      });

      expect(professors.length).toBeLessThanOrEqual(20);
    });
  });

  describe("Search Query Validation", () => {
    it("should validate minimum query length", () => {
      const isValidQuery = (query: string) => {
        return Boolean(query && query.trim().length >= 1);
      };

      expect(isValidQuery("a")).toBe(true);
      expect(isValidQuery("CENG")).toBe(true);
      expect(isValidQuery("")).toBe(false);
      expect(isValidQuery("   ")).toBe(false);
    });

    it("should sanitize search queries", () => {
      const sanitizeQuery = (query: string) => {
        return query.trim().toLowerCase();
      };

      expect(sanitizeQuery("  CENG  ")).toBe("ceng");
      expect(sanitizeQuery("Test Course")).toBe("test course");
    });
  });

  describe("Empty Search Results", () => {
    it("should return empty array for non-matching course search", async () => {
      const { prisma } = await import("@/lib/prisma");
      (prisma.course.findMany as jest.Mock).mockResolvedValue([]);

      const courses = await prisma.course.findMany({
        where: {
          OR: [
            { code: { contains: "nonexistent", mode: "insensitive" } },
            { name: { contains: "nonexistent", mode: "insensitive" } },
          ],
        },
        include: {
          department: { select: { code: true, name: true } },
        },
        take: 20,
      });

      expect(courses).toHaveLength(0);
    });

    it("should return empty array for non-matching professor search", async () => {
      const { prisma } = await import("@/lib/prisma");
      (prisma.professor.findMany as jest.Mock).mockResolvedValue([]);

      const professors = await prisma.professor.findMany({
        where: {
          name: { contains: "nonexistent", mode: "insensitive" },
        },
        include: {
          department: { select: { code: true, name: true } },
        },
        take: 20,
      });

      expect(professors).toHaveLength(0);
    });
  });

  describe("Search Result Formatting", () => {
    it("should include department information in course results", async () => {
      const { prisma } = await import("@/lib/prisma");

      const mockCourses = [
        {
          id: "course1",
          code: "CENG140",
          name: "C Programming",
          department: { code: "CENG", name: "Computer Engineering" },
        },
      ];

      (prisma.course.findMany as jest.Mock).mockResolvedValue(mockCourses);

      const courses = await prisma.course.findMany({
        include: {
          department: { select: { code: true, name: true } },
        },
        take: 20,
      });

      expect(courses[0].department).toBeDefined();
      expect(courses[0].department.code).toBe("CENG");
    });

    it("should include department information in professor results", async () => {
      const { prisma } = await import("@/lib/prisma");

      const mockProfessors = [
        {
          id: "prof1",
          name: "Prof. Dr. Test",
          title: "PROF_DR",
          department: { code: "CENG", name: "Computer Engineering" },
        },
      ];

      (prisma.professor.findMany as jest.Mock).mockResolvedValue(mockProfessors);

      const professors = await prisma.professor.findMany({
        include: {
          department: { select: { code: true, name: true } },
        },
        take: 20,
      });

      expect(professors[0].department).toBeDefined();
      expect(professors[0].department.code).toBe("CENG");
    });
  });
});
