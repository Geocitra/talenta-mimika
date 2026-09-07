-- CreateTable
CREATE TABLE "master_majors" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "master_majors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "major_suggestions" (
    "id" UUID NOT NULL,
    "suggested_name" VARCHAR(150) NOT NULL,
    "ai_normalized_name" VARCHAR(150),
    "inferred_category" VARCHAR(100),
    "input_count" INTEGER NOT NULL DEFAULT 1,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "sample_inputs" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "major_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "master_majors_name_key" ON "master_majors"("name");

-- CreateIndex
CREATE INDEX "master_majors_name_idx" ON "master_majors"("name");

-- CreateIndex
CREATE INDEX "master_majors_category_idx" ON "master_majors"("category");

-- CreateIndex
CREATE UNIQUE INDEX "major_suggestions_suggested_name_key" ON "major_suggestions"("suggested_name");

-- CreateIndex
CREATE INDEX "major_suggestions_status_idx" ON "major_suggestions"("status");
