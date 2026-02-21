import { z } from "zod";

// Common password patterns to block
const commonPasswords = [
  "password",
  "123456",
  "12345678",
  "qwerty",
  "abc123",
  "monkey",
  "1234567",
  "letmein",
  "trustno1",
  "dragon",
  "odtu",
  "metu",
  "pusula",
];

// Strong password schema with comprehensive validation
export const passwordSchema = z
  .string()
  .min(8, "Şifre en az 8 karakter olmalıdır")
  .max(128, "Şifre en fazla 128 karakter olabilir")
  .refine(
    (password) => /[A-Z]/.test(password),
    "Şifre en az bir büyük harf içermelidir"
  )
  .refine(
    (password) => /[a-z]/.test(password),
    "Şifre en az bir küçük harf içermelidir"
  )
  .refine(
    (password) => /[0-9]/.test(password),
    "Şifre en az bir rakam içermelidir"
  )
  .refine(
    (password) => /[^A-Za-z0-9]/.test(password),
    "Şifre en az bir özel karakter içermelidir (!@#$%^&* vb.)"
  )
  .refine(
    (password) => !commonPasswords.some((common) =>
      password.toLowerCase().includes(common)
    ),
    "Bu şifre çok yaygın, lütfen daha güvenli bir şifre seçin"
  );

// Email validation for METU domain
export const metuEmailSchema = z
  .string()
  .email("Geçerli bir email adresi giriniz")
  .refine(
    (email) => email.endsWith("@metu.edu.tr"),
    "Sadece @metu.edu.tr mail adresleri kabul edilir"
  );

// Name validation
export const nameSchema = z
  .string()
  .min(2, "İsim en az 2 karakter olmalıdır")
  .max(100, "İsim en fazla 100 karakter olabilir")
  .refine(
    (name) => /^[\p{L}\s'-]+$/u.test(name),
    "İsim sadece harf, boşluk, tire ve kesme işareti içerebilir"
  );

// Year enum
export const yearSchema = z.enum([
  "PREP",
  "FRESHMAN",
  "SOPHOMORE",
  "JUNIOR",
  "SENIOR",
  "MASTERS",
  "PHD",
]);

// Sanitize user input to prevent XSS
export function sanitizeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

// Validate and sanitize review comment
export const reviewCommentSchema = z
  .string()
  .min(15, "Yorum en az 15 karakter olmalıdır")
  .max(2000, "Yorum en fazla 2000 karakter olabilir")
  .transform(sanitizeHtml);

// Registration schema with strong validation
export const registerSchema = z.object({
  name: nameSchema,
  email: metuEmailSchema,
  password: passwordSchema,
  department: z.string().min(1, "Bölüm seçiniz"),
  year: yearSchema,
});

// Login schema
export const loginSchema = z.object({
  email: metuEmailSchema,
  password: z.string().min(1, "Şifre gereklidir"),
});

// Password reset schema
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token gereklidir"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });
