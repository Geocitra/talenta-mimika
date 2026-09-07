-- AlterTable
ALTER TABLE "employers" ADD COLUMN     "address" TEXT,
ADD COLUMN     "company_bio" TEXT,
ADD COLUMN     "employee_count" INTEGER DEFAULT 0,
ADD COLUMN     "industry_sector" VARCHAR(150),
ADD COLUMN     "location_lat" DOUBLE PRECISION,
ADD COLUMN     "location_lng" DOUBLE PRECISION,
ADD COLUMN     "verified_at" TIMESTAMP(3),
ADD COLUMN     "verified_by" UUID;
