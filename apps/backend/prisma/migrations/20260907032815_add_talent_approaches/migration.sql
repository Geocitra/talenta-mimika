-- AlterTable
ALTER TABLE "talents" ADD COLUMN     "location_lat" DOUBLE PRECISION,
ADD COLUMN     "location_lng" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "talent_approaches" (
    "id" UUID NOT NULL,
    "vacancy_id" UUID NOT NULL,
    "talent_id" UUID NOT NULL,
    "ai_match_score" DECIMAL(5,2) NOT NULL,
    "ai_reasoning" JSONB NOT NULL DEFAULT '{}',
    "status" VARCHAR(50) NOT NULL DEFAULT 'APPROACHED',
    "talent_notified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "talent_approaches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "talent_approaches_vacancy_id_talent_id_key" ON "talent_approaches"("vacancy_id", "talent_id");

-- AddForeignKey
ALTER TABLE "talent_approaches" ADD CONSTRAINT "talent_approaches_vacancy_id_fkey" FOREIGN KEY ("vacancy_id") REFERENCES "job_vacancies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "talent_approaches" ADD CONSTRAINT "talent_approaches_talent_id_fkey" FOREIGN KEY ("talent_id") REFERENCES "talents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
