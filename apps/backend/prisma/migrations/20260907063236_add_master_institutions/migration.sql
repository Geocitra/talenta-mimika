-- CreateEnum
CREATE TYPE "InstitutionCategory" AS ENUM ('KAMPUS', 'SMA', 'SMK');

-- CreateTable
CREATE TABLE "master_institutions" (
    "id" UUID NOT NULL,
    "external_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "short_name" VARCHAR(100),
    "category" "InstitutionCategory" NOT NULL,
    "status" VARCHAR(50),
    "province_name" VARCHAR(100),
    "regency_name" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_institutions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "master_institutions_external_id_key" ON "master_institutions"("external_id");

-- CreateIndex
CREATE INDEX "master_institutions_name_idx" ON "master_institutions"("name");

-- CreateIndex
CREATE INDEX "master_institutions_short_name_idx" ON "master_institutions"("short_name");

-- CreateIndex
CREATE INDEX "master_institutions_category_idx" ON "master_institutions"("category");
