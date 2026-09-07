-- CreateEnum
CREATE TYPE "TrainingDeliveryMode" AS ENUM ('ONLINE', 'OFFLINE', 'HYBRID');

-- CreateEnum
CREATE TYPE "TrainingCategory" AS ENUM ('K3_PERTAMBANGAN', 'ALAT_BERAT', 'WELDING', 'MEKANIK', 'DIGITAL_IT', 'LOGISTIK', 'HOSPITALITY');

-- CreateEnum
CREATE TYPE "TrainingProgramStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED');

-- CreateEnum
CREATE TYPE "TrainingEnrollmentStatus" AS ENUM ('ENROLLED', 'ONGOING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "QuizType" AS ENUM ('CHECKPOINT', 'FINAL_EXAM');

-- CreateEnum
CREATE TYPE "SessionContentType" AS ENUM ('VIDEO', 'TEXT_ARTICLE', 'DOCUMENT_PDF');

-- CreateTable
CREATE TABLE "training_programs" (
    "id" UUID NOT NULL,
    "created_by" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "provider_name" VARCHAR(255) NOT NULL DEFAULT 'Disnakertrans Mimika',
    "delivery_mode" "TrainingDeliveryMode" NOT NULL DEFAULT 'ONLINE',
    "category" "TrainingCategory" NOT NULL DEFAULT 'K3_PERTAMBANGAN',
    "description" TEXT NOT NULL,
    "syllabus" TEXT,
    "quota" INTEGER DEFAULT 30,
    "total_sessions" INTEGER NOT NULL DEFAULT 1,
    "passing_grade" INTEGER NOT NULL DEFAULT 80,
    "target_skills" JSONB NOT NULL DEFAULT '[]',
    "status" "TrainingProgramStatus" NOT NULL DEFAULT 'DRAFT',
    "start_date" DATE,
    "end_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_sessions" (
    "id" UUID NOT NULL,
    "program_id" UUID NOT NULL,
    "session_order" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content_type" "SessionContentType" NOT NULL DEFAULT 'TEXT_ARTICLE',
    "content_body" TEXT NOT NULL,
    "has_checkpoint_quiz" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_quizzes" (
    "id" UUID NOT NULL,
    "program_id" UUID,
    "session_id" UUID,
    "quiz_type" "QuizType" NOT NULL DEFAULT 'CHECKPOINT',
    "title" VARCHAR(255) NOT NULL,
    "passing_score" INTEGER NOT NULL DEFAULT 75,
    "time_limit_minutes" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_questions" (
    "id" UUID NOT NULL,
    "quiz_id" UUID NOT NULL,
    "question_order" INTEGER NOT NULL,
    "question_text" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correct_answer" VARCHAR(10) NOT NULL,
    "explanation" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_enrollments" (
    "id" UUID NOT NULL,
    "talent_id" UUID NOT NULL,
    "program_id" UUID NOT NULL,
    "status" "TrainingEnrollmentStatus" NOT NULL DEFAULT 'ENROLLED',
    "current_session_unlocked" INTEGER NOT NULL DEFAULT 1,
    "final_score" DECIMAL(5,2),
    "certificate_number" VARCHAR(100),
    "certificate_url" TEXT,
    "qr_code_hash" VARCHAR(255),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "talent_lesson_progress" (
    "id" UUID NOT NULL,
    "enrollment_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "talent_lesson_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "talent_quiz_attempts" (
    "id" UUID NOT NULL,
    "enrollment_id" UUID NOT NULL,
    "quiz_id" UUID NOT NULL,
    "score" INTEGER NOT NULL,
    "is_passed" BOOLEAN NOT NULL,
    "submitted_answers" JSONB NOT NULL,
    "attempted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "talent_quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "training_sessions_program_id_session_order_key" ON "training_sessions"("program_id", "session_order");

-- CreateIndex
CREATE UNIQUE INDEX "training_quizzes_session_id_key" ON "training_quizzes"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_questions_quiz_id_question_order_key" ON "quiz_questions"("quiz_id", "question_order");

-- CreateIndex
CREATE UNIQUE INDEX "training_enrollments_certificate_number_key" ON "training_enrollments"("certificate_number");

-- CreateIndex
CREATE UNIQUE INDEX "training_enrollments_talent_id_program_id_key" ON "training_enrollments"("talent_id", "program_id");

-- CreateIndex
CREATE UNIQUE INDEX "talent_lesson_progress_enrollment_id_session_id_key" ON "talent_lesson_progress"("enrollment_id", "session_id");

-- AddForeignKey
ALTER TABLE "training_programs" ADD CONSTRAINT "training_programs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_sessions" ADD CONSTRAINT "training_sessions_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "training_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_quizzes" ADD CONSTRAINT "training_quizzes_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "training_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_quizzes" ADD CONSTRAINT "training_quizzes_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "training_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "training_quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_enrollments" ADD CONSTRAINT "training_enrollments_talent_id_fkey" FOREIGN KEY ("talent_id") REFERENCES "talents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_enrollments" ADD CONSTRAINT "training_enrollments_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "training_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "talent_lesson_progress" ADD CONSTRAINT "talent_lesson_progress_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "training_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "talent_lesson_progress" ADD CONSTRAINT "talent_lesson_progress_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "training_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "talent_quiz_attempts" ADD CONSTRAINT "talent_quiz_attempts_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "training_enrollments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "talent_quiz_attempts" ADD CONSTRAINT "talent_quiz_attempts_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "training_quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
