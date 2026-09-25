-- CreateEnum
CREATE TYPE "TargetWorkforce" AS ENUM ('ALL', 'LOCAL_ONLY', 'NON_LOCAL');

-- AlterTable
ALTER TABLE "job_vacancies" ADD COLUMN "target_workforce" "TargetWorkforce" NOT NULL DEFAULT 'ALL';
