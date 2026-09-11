-- CreateEnum
CREATE TYPE "EmploymentContractType" AS ENUM ('PKWT', 'PKWTT', 'HARIAN_LEPAS', 'PEMAGANGAN');

-- AlterTable
ALTER TABLE "job_vacancies" ADD COLUMN "contract_type" "EmploymentContractType" NOT NULL DEFAULT 'PKWT',
ADD COLUMN "contract_duration_months" INTEGER DEFAULT 12;
