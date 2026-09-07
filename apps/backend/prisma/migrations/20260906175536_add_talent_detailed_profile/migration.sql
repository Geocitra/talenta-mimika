-- AlterTable
ALTER TABLE "talents" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "education" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "is_available" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "skills" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "social_dna" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "work_experience" JSONB NOT NULL DEFAULT '[]';
