-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'TRAINING_PROVIDER';

-- CreateEnum
CREATE TYPE "InstitutionType" AS ENUM ('BLK_PEMERINTAH', 'LPK_SWASTA', 'LSP_BNSP', 'PUSAT_PELATIHAN_INDUSTRI');

-- CreateEnum
CREATE TYPE "ProgramFundingType" AS ENUM ('GRATIS_APBD_MIMIKA', 'BEASISWA_CSR', 'MANDIRI_BERBAYAR');

-- CreateEnum
CREATE TYPE "TrainingMethod" AS ENUM ('BOARDING', 'NON_BOARDING', 'MTU');

-- CreateEnum
CREATE TYPE "CertificateType" AS ENUM ('PELATIHAN_STTP', 'KOMPETENSI_BNSP', 'LISENSI_K3_KEMNAKER', 'KOMBINASI_LENGKAP');

-- CreateEnum
CREATE TYPE "ProgramApprovalStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "BatchEnrollmentStatus" AS ENUM ('REGISTERED', 'ADMITTED', 'REJECTED_SELECTION', 'COMPLETED', 'DROPPED_OUT');

-- CreateTable
CREATE TABLE "training_providers" (
    "id" UUID NOT NULL,
    "institution_name" VARCHAR(255) NOT NULL,
    "institution_type" "InstitutionType" NOT NULL DEFAULT 'LPK_SWASTA',
    "vin_number" VARCHAR(50),
    "bnsp_license_number" VARCHAR(50),
    "legal_doc_url" TEXT,
    "logo_url" VARCHAR(500),
    "accreditation" VARCHAR(50) DEFAULT 'BELUM_TERAKREDITASI',
    "pic_name" VARCHAR(150),
    "pic_role" VARCHAR(100),
    "pic_phone" VARCHAR(30),
    "pic_email" VARCHAR(150),
    "address" TEXT,
    "location_lat" DOUBLE PRECISION,
    "location_lng" DOUBLE PRECISION,
    "institution_bio" TEXT,
    "website_url" VARCHAR(255),
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verification_notes" TEXT,
    "verified_at" TIMESTAMP(3),
    "verified_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_batches" (
    "id" UUID NOT NULL,
    "program_id" UUID NOT NULL,
    "batch_name" VARCHAR(100) NOT NULL,
    "batch_number" INTEGER NOT NULL DEFAULT 1,
    "funding_type" "ProgramFundingType" NOT NULL DEFAULT 'GRATIS_APBD_MIMIKA',
    "price_amount" DECIMAL(12,2),
    "training_method" "TrainingMethod" NOT NULL DEFAULT 'NON_BOARDING',
    "quota" INTEGER NOT NULL DEFAULT 20,
    "welfare_benefits" JSONB NOT NULL DEFAULT '[]',
    "registration_start" DATE NOT NULL,
    "registration_end" DATE NOT NULL,
    "training_start" DATE NOT NULL,
    "training_end" DATE NOT NULL,
    "venue_address" TEXT,
    "venue_lat" DOUBLE PRECISION,
    "venue_lng" DOUBLE PRECISION,
    "is_open" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_batches_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "training_programs" ADD COLUMN "provider_id" UUID,
ADD COLUMN "program_code" VARCHAR(20),
ADD COLUMN "sub_category" VARCHAR(100),
ADD COLUMN "certificate_type" "CertificateType" NOT NULL DEFAULT 'PELATIHAN_STTP',
ADD COLUMN "requirements" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN "total_lesson_hours" INTEGER DEFAULT 160,
ADD COLUMN "duration_days" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN "approval_status" "ProgramApprovalStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN "approval_notes" TEXT,
ADD COLUMN "cover_image_url" VARCHAR(500),
ADD COLUMN "rating_score" DECIMAL(3,2) NOT NULL DEFAULT 5.0,
ADD COLUMN "review_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "training_enrollments" DROP CONSTRAINT IF EXISTS "training_enrollments_talent_id_program_id_key";
ALTER TABLE "training_enrollments" ADD COLUMN "batch_id" UUID,
ADD COLUMN "selection_status" "BatchEnrollmentStatus" NOT NULL DEFAULT 'REGISTERED',
ADD COLUMN "bnsp_certificate_number" VARCHAR(100);

-- CreateIndex
CREATE UNIQUE INDEX "training_enrollments_talent_id_program_id_batch_id_key" ON "training_enrollments"("talent_id", "program_id", "batch_id");

-- AddForeignKey
ALTER TABLE "training_providers" ADD CONSTRAINT "training_providers_id_fkey" FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_programs" ADD CONSTRAINT "training_programs_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "training_providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_batches" ADD CONSTRAINT "training_batches_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "training_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_enrollments" ADD CONSTRAINT "training_enrollments_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "training_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
