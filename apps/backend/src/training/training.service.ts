import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrainingProgramDto } from './dto/create-training-program.dto';
import { CreateTrainingSessionDto } from './dto/create-training-session.dto';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { SubmitQuizAnswerDto } from './dto/submit-quiz.dto';
import {
  TrainingProgramStatus,
  TrainingEnrollmentStatus,
  QuizType,
} from '@prisma/client';
import * as crypto from 'crypto';

// Service LMS & Progressive Lock Engine
@Injectable()
export class TrainingService {
  private readonly logger = new Logger(TrainingService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================================
  // KANAL 1: MANAJEMEN PROGRAM OLEH DISNAKER ADMIN
  // ============================================================
  async createProgram(adminId: string, dto: CreateTrainingProgramDto) {
    const program = await this.prisma.trainingProgram.create({
      data: {
        createdBy: adminId,
        title: dto.title,
        providerName: dto.providerName || 'Disnakertrans Mimika',
        deliveryMode: dto.deliveryMode,
        category: dto.category,
        description: dto.description,
        syllabus: dto.syllabus,
        quota: dto.quota || 30,
        passingGrade: dto.passingGrade || 80,
        targetSkills: dto.targetSkills,
        status: TrainingProgramStatus.DRAFT,
      },
    });

    return {
      status: 'success',
      message: 'Draft program pelatihan berhasil dibuat.',
      data: program,
    };
  }

  async publishProgram(programId: string) {
    const program = await this.prisma.trainingProgram.findUnique({
      where: { id: programId },
    });
    if (!program) throw new NotFoundException('Program pelatihan tidak ditemukan.');

    const published = await this.prisma.trainingProgram.update({
      where: { id: programId },
      data: { status: TrainingProgramStatus.PUBLISHED },
    });

    return {
      status: 'success',
      message: `Program ${program.title} resmi dipublikasikan ke katalog daerah.`,
      data: published,
    };
  }

  async addSessionToProgram(programId: string, dto: CreateTrainingSessionDto) {
    const program = await this.prisma.trainingProgram.findUnique({
      where: { id: programId },
    });
    if (!program) throw new NotFoundException('Program pelatihan tidak ditemukan.');

    const session = await this.prisma.trainingSession.create({
      data: {
        programId,
        sessionOrder: dto.sessionOrder,
        title: dto.title,
        contentType: dto.contentType,
        contentBody: dto.contentBody,
        hasCheckpointQuiz: dto.hasCheckpointQuiz ?? false,
      },
    });

    // Update total sesi di program
    await this.prisma.trainingProgram.update({
      where: { id: programId },
      data: { totalSessions: { increment: 1 } },
    });

    return {
      status: 'success',
      message: `Sesi ${dto.sessionOrder}: ${dto.title} berhasil ditambahkan.`,
      data: session,
    };
  }

  async addQuiz(targetId: string, isProgramFinalExam: boolean, dto: CreateQuizDto) {
    const quiz = await this.prisma.trainingQuiz.create({
      data: {
        programId: isProgramFinalExam ? targetId : null,
        sessionId: !isProgramFinalExam ? targetId : null,
        quizType: dto.quizType,
        title: dto.title,
        passingScore: dto.passingScore,
        timeLimitMinutes: dto.timeLimitMinutes,
        questions: {
          create: dto.questions.map((q) => ({
            questionOrder: q.questionOrder,
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
          })),
        },
      },
      include: { questions: true },
    });

    // Jika checkpoint quiz, tandai sesi tersebut
    if (!isProgramFinalExam) {
      await this.prisma.trainingSession.update({
        where: { id: targetId },
        data: { hasCheckpointQuiz: true },
      });
    }

    return {
      status: 'success',
      message: `Kuis ${dto.title} dengan ${dto.questions.length} butir soal berhasil dibuat.`,
      data: quiz,
    };
  }

  // ============================================================
  // KANAL 2: KATALOG & PENDAFTARAN OLEH TALENTA
  // ============================================================
  async getCatalog() {
    const programs = await this.prisma.trainingProgram.findMany({
      where: { status: TrainingProgramStatus.PUBLISHED },
      include: {
        sessions: {
          select: { id: true, sessionOrder: true, title: true, contentType: true, hasCheckpointQuiz: true },
          orderBy: { sessionOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      status: 'success',
      total: programs.length,
      data: programs,
    };
  }

  async enrollProgram(programId: string, talentId: string) {
    const program = await this.prisma.trainingProgram.findUnique({
      where: { id: programId },
    });
    if (!program || program.status !== TrainingProgramStatus.PUBLISHED) {
      throw new NotFoundException('Program pelatihan tidak tersedia untuk pendaftaran.');
    }

    const existingEnrollment = await this.prisma.trainingEnrollment.findUnique({
      where: { talentId_programId: { talentId, programId } },
    });
    if (existingEnrollment) {
      throw new ConflictException('Anda sudah terdaftar dalam program pelatihan ini.');
    }

    const enrollment = await this.prisma.trainingEnrollment.create({
      data: {
        talentId,
        programId,
        status: TrainingEnrollmentStatus.ENROLLED,
        currentSessionUnlocked: 1, // Sesi 1 terbuka otomatis
      },
    });

    return {
      status: 'success',
      message: `Pendaftaran berhasil! Anda kini terdaftar di kelas ${program.title}.`,
      data: enrollment,
    };
  }

  async getMyEnrollments(talentId: string) {
    const enrollments = await this.prisma.trainingEnrollment.findMany({
      where: { talentId },
      include: {
        program: {
          include: {
            sessions: {
              select: { id: true, sessionOrder: true, title: true },
              orderBy: { sessionOrder: 'asc' },
            },
            quizzes: {
              where: { quizType: QuizType.FINAL_EXAM },
              select: {
                id: true,
                title: true,
                passingScore: true,
                timeLimitMinutes: true,
                questions: {
                  select: { id: true, questionOrder: true, questionText: true, options: true },
                  orderBy: { questionOrder: 'asc' },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      status: 'success',
      total: enrollments.length,
      data: enrollments,
    };
  }

  // ============================================================
  // KANAL 3: PROGRESSIVE LOCK ENGINE (KONSUMSI MATERI)
  // ============================================================
  async getSessionContent(programId: string, sessionOrder: number, talentId: string) {
    const enrollment = await this.prisma.trainingEnrollment.findUnique({
      where: { talentId_programId: { talentId, programId } },
    });
    if (!enrollment) {
      throw new ForbiddenException('Anda belum terdaftar dalam program pelatihan ini.');
    }

    // INVARIANT: Cegah talenta melompati sesi yang masih terkunci
    if (sessionOrder > enrollment.currentSessionUnlocked) {
      throw new ForbiddenException(
        `Sesi ${sessionOrder} masih terkunci. Anda harus menyelesaikan materi dan kuis sesi sebelumnya terlebih dahulu.`,
      );
    }

    const session = await this.prisma.trainingSession.findUnique({
      where: { programId_sessionOrder: { programId, sessionOrder } },
      include: {
        checkpointQuiz: {
          select: {
            id: true,
            title: true,
            passingScore: true,
            timeLimitMinutes: true,
            questions: {
              select: { id: true, questionOrder: true, questionText: true, options: true }, // KUNCI JAWABAN TIDAK DIBOCORKAN!
              orderBy: { questionOrder: 'asc' },
            },
          },
        },
      },
    });

    if (!session) throw new NotFoundException('Sesi materi tidak ditemukan.');

    return {
      status: 'success',
      data: {
        ...session,
        currentUnlocked: enrollment.currentSessionUnlocked,
      },
    };
  }

  async completeSession(sessionId: string, talentId: string) {
    const session = await this.prisma.trainingSession.findUnique({
      where: { id: sessionId },
    });
    if (!session) throw new NotFoundException('Sesi tidak ditemukan.');

    const enrollment = await this.prisma.trainingEnrollment.findUnique({
      where: { talentId_programId: { talentId, programId: session.programId } },
    });
    if (!enrollment) throw new ForbiddenException('Pendaftaran tidak ditemukan.');

    // Rekam progress sesi
    await this.prisma.talentLessonProgress.upsert({
      where: {
        enrollmentId_sessionId: { enrollmentId: enrollment.id, sessionId },
      },
      create: {
        enrollmentId: enrollment.id,
        sessionId,
        isCompleted: true,
        completedAt: new Date(),
      },
      update: {
        isCompleted: true,
        completedAt: new Date(),
      },
    });

    // Jika sesi TIDAK memiliki kuis antara, langsung buka kunci sesi berikutnya!
    if (!session.hasCheckpointQuiz) {
      const nextSessionNumber = session.sessionOrder + 1;
      if (nextSessionNumber > enrollment.currentSessionUnlocked) {
        await this.prisma.trainingEnrollment.update({
          where: { id: enrollment.id },
          data: {
            currentSessionUnlocked: nextSessionNumber,
            status: TrainingEnrollmentStatus.ONGOING,
          },
        });
      }
    }

    return {
      status: 'success',
      message: `Sesi ${session.sessionOrder} berhasil diselesaikan.`,
    };
  }

  // ============================================================
  // KANAL 4: EVALUASI KUIS, UJIAN AKHIR, & THE AUTO-SKILL INJECTION
  // ============================================================
  async submitQuiz(quizId: string, talentId: string, dto: SubmitQuizAnswerDto) {
    const quiz = await this.prisma.trainingQuiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true,
        session: true,
        program: true,
      },
    });
    if (!quiz) throw new NotFoundException('Kuis/Ujian tidak ditemukan.');

    const programId = quiz.programId || quiz.session?.programId;
    if (!programId) throw new BadRequestException('Korelasi program kuis tidak valid.');

    const enrollment = await this.prisma.trainingEnrollment.findUnique({
      where: { talentId_programId: { talentId, programId } },
    });
    if (!enrollment) throw new ForbiddenException('Pendaftaran kelas tidak valid.');

    // 1. KOREKSI JAWABAN OTOMATIS
    let correctCount = 0;
    quiz.questions.forEach((q) => {
      const submitted = dto.answers[q.id];
      if (submitted && submitted.trim().toUpperCase() === q.correctAnswer.trim().toUpperCase()) {
        correctCount++;
      }
    });

    const totalQuestions = quiz.questions.length;
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 100;
    const isPassed = score >= quiz.passingScore;

    // 2. REKAM PERCOBAAN EVALUASI
    await this.prisma.talentQuizAttempt.create({
      data: {
        enrollmentId: enrollment.id,
        quizId: quiz.id,
        score,
        isPassed,
        submittedAnswers: dto.answers,
      },
    });

    // 3. LOGIKA JALUR A: KUIS ANTARA (CHECKPOINT QUIZ)
    if (quiz.quizType === QuizType.CHECKPOINT && quiz.session) {
      if (isPassed) {
        const nextOrder = quiz.session.sessionOrder + 1;
        if (nextOrder > enrollment.currentSessionUnlocked) {
          await this.prisma.trainingEnrollment.update({
            where: { id: enrollment.id },
            data: { currentSessionUnlocked: nextOrder },
          });
        }
        return {
          status: 'success',
          isPassed: true,
          score,
          message: `Selamat! Anda lulus Kuis Antara Sesi ${quiz.session.sessionOrder} dengan skor ${score}%. Sesi berikutnya kini terbuka!`,
        };
      } else {
        return {
          status: 'fail',
          isPassed: false,
          score,
          message: `Skor Anda ${score}%, di bawah standar kelulusan (${quiz.passingScore}%). Silakan baca ulang materi dan coba lagi.`,
        };
      }
    }

    // 4. LOGIKA JALUR B: UJIAN AKHIR (FINAL EXAM & AUTO-SKILL INJECTION)
    if (quiz.quizType === QuizType.FINAL_EXAM) {
      if (isPassed) {
        const certNumber = `CERT-MT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const qrHash = crypto.createHash('sha256').update(`${certNumber}-${talentId}`).digest('hex');

        // A. Perbarui Status Kelulusan & Sertifikasi di Enrollment
        await this.prisma.trainingEnrollment.update({
          where: { id: enrollment.id },
          data: {
            status: TrainingEnrollmentStatus.COMPLETED,
            finalScore: score,
            certificateNumber: certNumber,
            qrCodeHash: qrHash,
            completedAt: new Date(),
          },
        });

        // B. THE CLOSED-LOOP SYNERGY: AUTO-SKILL INJECTION!
        const program = await this.prisma.trainingProgram.findUnique({ where: { id: programId } });
        const talent = await this.prisma.talent.findUnique({ where: { id: talentId } });

        if (program && talent) {
          const targetSkills = (Array.isArray(program.targetSkills) ? program.targetSkills : []) as any[];
          const existingSkills = (Array.isArray(talent.skills) ? talent.skills : []) as any[];

          // Merge skill baru tanpa duplikasi (jika sudah ada, perbarui level kemahirannya)
          const mergedSkills = [...existingSkills];
          targetSkills.forEach((newSkill) => {
            const index = mergedSkills.findIndex(
              (s) => s.name?.toLowerCase() === newSkill.name?.toLowerCase(),
            );
            if (index >= 0) {
              mergedSkills[index] = newSkill; // Upgrade level
            } else {
              mergedSkills.push(newSkill); // Injeksi keahlian baru
            }
          });

          await this.prisma.talent.update({
            where: { id: talentId },
            data: { skills: mergedSkills },
          });

          this.logger.log(
            `\n[AUTO-SKILL INJECTION] =====================================`,
          );
          this.logger.log(`Talenta        : ${talent.fullName}`);
          this.logger.log(`Program Lulus  : ${program.title}`);
          this.logger.log(`No. Sertifikat : ${certNumber}`);
          this.logger.log(`Skill Terinjeksi: ${JSON.stringify(targetSkills)}`);
          this.logger.log(`Status         : Keahlian profil talenta otomatis ter-upgrade!`);
          this.logger.log(`============================================================\n`);
        }

        return {
          status: 'success',
          isPassed: true,
          score,
          certificateNumber: certNumber,
          message: `LULUS UJIAN AKHIR! Skor Anda ${score}%. Sertifikat resmi telah terbit dan keahlian baru telah otomatis ditambahkan ke profil Anda!`,
        };
      } else {
        return {
          status: 'fail',
          isPassed: false,
          score,
          message: `Skor Ujian Akhir Anda ${score}%, belum memenuhi passing grade (${quiz.passingScore}%). Silakan ambil ujian remedial.`,
        };
      }
    }

    throw new BadRequestException('Tipe kuis tidak valid untuk dievaluasi.');
  }
}
