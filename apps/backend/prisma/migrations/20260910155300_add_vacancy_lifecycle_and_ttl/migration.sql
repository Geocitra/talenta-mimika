-- AlterEnum
ALTER TYPE "VacancyStatus" ADD VALUE 'EXPIRED';

-- AlterTable
ALTER TABLE "job_vacancies" ADD COLUMN "active_days_duration" INTEGER NOT NULL DEFAULT 14,
ADD COLUMN "expires_at" TIMESTAMP(3),
ADD COLUMN "closure_reason" VARCHAR(255);
