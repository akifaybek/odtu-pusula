-- Migration: Eksik alanlar ve tablolar ekleniyor
-- Bu migration şemaya eklenen ama DB'ye uygulanmamış değişiklikleri içerir

-- ============== CourseType Enum ==============
DO $$ BEGIN
    CREATE TYPE "CourseType" AS ENUM ('REQUIRED', 'ELECTIVE', 'TECH_ELECTIVE', 'NON_TECH', 'FREE_ELECTIVE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============== Course tablosuna courseType kolonu ekle ==============
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "courseType" "CourseType";

-- ============== CourseReview tablosuna wouldRecommend kolonu ekle ==============
ALTER TABLE "CourseReview" ADD COLUMN IF NOT EXISTS "wouldRecommend" BOOLEAN;

-- ============== Suggestion tablosu oluştur ==============
CREATE TABLE IF NOT EXISTS "Suggestion" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "courseCode" TEXT,
    "courseName" TEXT,
    "professorName" TEXT,
    "department" TEXT,
    "additionalInfo" TEXT,
    "contactEmail" TEXT,
    "userId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Suggestion_pkey" PRIMARY KEY ("id")
);

-- ============== Suggestion tablosuna index'ler ekle ==============
CREATE INDEX IF NOT EXISTS "Suggestion_status_idx" ON "Suggestion"("status");
CREATE INDEX IF NOT EXISTS "Suggestion_createdAt_idx" ON "Suggestion"("createdAt");
CREATE INDEX IF NOT EXISTS "Suggestion_type_idx" ON "Suggestion"("type");

-- ============== Suggestion → User foreign key ==============
DO $$ BEGIN
    ALTER TABLE "Suggestion" ADD CONSTRAINT "Suggestion_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
