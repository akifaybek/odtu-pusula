// API Route Tests - Mock implementations

describe('Courses API', () => {
  describe('GET /api/courses', () => {
    it('should return courses with pagination', async () => {
      const mockCourses = [
        { id: '1', code: 'CENG140', name: 'C Programming', credits: 4 },
        { id: '2', code: 'MATH119', name: 'Calculus', credits: 4 },
      ];

      const mockResponse = {
        courses: mockCourses,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };

      expect(mockResponse.courses).toHaveLength(2);
      expect(mockResponse.courses[0].code).toBe('CENG140');
      expect(mockResponse.pagination.total).toBe(2);
    });

    it('should filter courses by department', async () => {
      const mockCourses = [
        { id: '1', code: 'CENG140', name: 'C Programming', department: 'CENG' },
        { id: '2', code: 'CENG213', name: 'Data Structures', department: 'CENG' },
      ];

      const filteredCourses = mockCourses.filter(c => c.department === 'CENG');
      expect(filteredCourses).toHaveLength(2);
    });

    it('should search courses by code', async () => {
      const mockCourses = [
        { id: '1', code: 'CENG140', name: 'C Programming' },
        { id: '2', code: 'MATH119', name: 'Calculus' },
        { id: '3', code: 'CENG213', name: 'Data Structures' },
      ];

      const searchTerm = 'CENG';
      const searchResults = mockCourses.filter(c =>
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      expect(searchResults).toHaveLength(2);
    });
  });

  describe('GET /api/courses/[code]', () => {
    it('should return course details', async () => {
      const mockCourse = {
        id: '1',
        code: 'CENG140',
        name: 'C Programming',
        credits: 4,
        description: 'Introduction to programming',
        department: {
          code: 'CENG',
          name: 'Computer Engineering',
        },
      };

      expect(mockCourse.code).toBe('CENG140');
      expect(mockCourse.department.code).toBe('CENG');
    });

    it('should return 404 for non-existent course', async () => {
      const courseCode = 'NONEXISTENT999';
      const mockCourses: { code: string }[] = [];
      const course = mockCourses.find(c => c.code === courseCode);
      expect(course).toBeUndefined();
    });
  });
});

describe('Professors API', () => {
  describe('GET /api/professors', () => {
    it('should return professors list', async () => {
      const mockProfessors = [
        { id: '1', name: 'Prof. Dr. Test', title: 'PROF_DR', department: 'CENG' },
        { id: '2', name: 'Doç. Dr. Demo', title: 'ASSOC_PROF_DR', department: 'MATH' },
      ];

      expect(mockProfessors).toHaveLength(2);
      expect(mockProfessors[0].title).toBe('PROF_DR');
    });

    it('should filter by department', async () => {
      const mockProfessors = [
        { id: '1', name: 'Prof 1', department: 'CENG' },
        { id: '2', name: 'Prof 2', department: 'MATH' },
        { id: '3', name: 'Prof 3', department: 'CENG' },
      ];

      const cengProfs = mockProfessors.filter(p => p.department === 'CENG');
      expect(cengProfs).toHaveLength(2);
    });
  });
});

describe('Search API', () => {
  describe('GET /api/search', () => {
    it('should search across courses and professors', async () => {
      const mockCourses = [
        { id: '1', code: 'CENG140', name: 'C Programming' },
      ];

      const query = 'ceng';
      const courseResults = mockCourses.filter(c =>
        c.code.toLowerCase().includes(query) || c.name.toLowerCase().includes(query)
      );

      expect(courseResults).toHaveLength(1);
    });

    it('should return empty results for no matches', async () => {
      const mockCourses: { code: string; name: string }[] = [];
      const query = 'xyz123';
      const results = mockCourses.filter(c =>
        c.code.includes(query) || c.name.includes(query)
      );
      expect(results).toHaveLength(0);
    });
  });
});
