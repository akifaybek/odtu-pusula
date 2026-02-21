// Validation utilities tests

describe('Email Validation', () => {
  const isValidMetuEmail = (email: string): boolean => {
    return email.endsWith('@metu.edu.tr');
  };

  it('accepts valid METU emails', () => {
    expect(isValidMetuEmail('student@metu.edu.tr')).toBe(true);
    expect(isValidMetuEmail('professor@metu.edu.tr')).toBe(true);
    expect(isValidMetuEmail('test.user@metu.edu.tr')).toBe(true);
  });

  it('rejects non-METU emails', () => {
    expect(isValidMetuEmail('user@gmail.com')).toBe(false);
    expect(isValidMetuEmail('user@yahoo.com')).toBe(false);
    expect(isValidMetuEmail('user@odtu.edu.tr')).toBe(false);
    expect(isValidMetuEmail('user@metu.edu')).toBe(false);
  });

  it('rejects empty or invalid emails', () => {
    expect(isValidMetuEmail('')).toBe(false);
    expect(isValidMetuEmail('notanemail')).toBe(false);
  });
});

describe('Password Validation', () => {
  const isValidPassword = (password: string): boolean => {
    return password.length >= 6;
  };

  it('accepts valid passwords', () => {
    expect(isValidPassword('123456')).toBe(true);
    expect(isValidPassword('password123')).toBe(true);
    expect(isValidPassword('securePassword!')).toBe(true);
  });

  it('rejects short passwords', () => {
    expect(isValidPassword('')).toBe(false);
    expect(isValidPassword('12345')).toBe(false);
    expect(isValidPassword('abc')).toBe(false);
  });
});

describe('Rating Validation', () => {
  const isValidRating = (rating: number): boolean => {
    return rating >= 1 && rating <= 5 && Number.isInteger(rating);
  };

  it('accepts valid ratings', () => {
    expect(isValidRating(1)).toBe(true);
    expect(isValidRating(3)).toBe(true);
    expect(isValidRating(5)).toBe(true);
  });

  it('rejects ratings out of range', () => {
    expect(isValidRating(0)).toBe(false);
    expect(isValidRating(6)).toBe(false);
    expect(isValidRating(-1)).toBe(false);
  });

  it('rejects non-integer ratings', () => {
    expect(isValidRating(2.5)).toBe(false);
    expect(isValidRating(3.7)).toBe(false);
  });
});

describe('Course Code Validation', () => {
  const isValidCourseCode = (code: string): boolean => {
    const pattern = /^[A-Z]{2,4}\d{3}$/;
    return pattern.test(code);
  };

  it('accepts valid course codes', () => {
    expect(isValidCourseCode('CENG140')).toBe(true);
    expect(isValidCourseCode('MATH119')).toBe(true);
    expect(isValidCourseCode('EE361')).toBe(true);
    expect(isValidCourseCode('PHYS105')).toBe(true);
  });

  it('rejects invalid course codes', () => {
    expect(isValidCourseCode('ceng140')).toBe(false);
    expect(isValidCourseCode('CENG14')).toBe(false);
    expect(isValidCourseCode('C140')).toBe(false);
    expect(isValidCourseCode('CENG1401')).toBe(false);
    expect(isValidCourseCode('')).toBe(false);
  });
});

describe('Semester Validation', () => {
  const isValidSemester = (semester: string): boolean => {
    const pattern = /^\d{4}-\d{4} (Güz|Bahar|Yaz)$/;
    return pattern.test(semester);
  };

  it('accepts valid semesters', () => {
    expect(isValidSemester('2023-2024 Güz')).toBe(true);
    expect(isValidSemester('2024-2025 Bahar')).toBe(true);
    expect(isValidSemester('2023-2024 Yaz')).toBe(true);
  });

  it('rejects invalid semesters', () => {
    expect(isValidSemester('2023 Güz')).toBe(false);
    expect(isValidSemester('2023-2024 Spring')).toBe(false);
    expect(isValidSemester('2023-2024')).toBe(false);
    expect(isValidSemester('')).toBe(false);
  });
});
