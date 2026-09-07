-- CreateEnum
CREATE TYPE "VacancyStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateTable
CREATE TABLE "job_vacancies" (
    "id" UUID NOT NULL,
    "employer_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "task_description" TEXT NOT NULL,
    "project_duration" VARCHAR(100) NOT NULL,
    "required_skills" JSONB NOT NULL DEFAULT '[]',
    "min_education" VARCHAR(50) NOT NULL,
    "min_experience_years" INTEGER NOT NULL DEFAULT 0,
    "allow_equivalence" BOOLEAN NOT NULL DEFAULT true,
    "job_location_lat" DOUBLE PRECISION,
    "job_location_lng" DOUBLE PRECISION,
    "status" "VacancyStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_vacancies_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "job_vacancies" ADD CONSTRAINT "job_vacancies_employer_id_fkey" FOREIGN KEY ("employer_id") REFERENCES "employers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
