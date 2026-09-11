import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BulkGraduationDto } from '../dto/bulk-graduation.dto';
import {
  BatchEnrollmentStatus,
  TrainingEnrollmentStatus,
} from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class BatchGraduationService {
  private readonly logger = new Logger(BatchGraduationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getBatchParticipants(batchId: string, actorUserId: string, isDisnaker: boolean) {
    const batch = await this.prisma.trainingBatch.findUnique({
      where: { id: batchId },
      include: {
        program: {
          include: {
            provider: true,
          },
        },
        enrollments: {
          include: {
            talent: {
              include: {
                user: { select: { email: true } },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!batch) {
      throw new NotFoundException('Batch cohort pelatihan tidak ditemukan.');
    }

    if (!isDisnaker && batch.program.providerId !== actorUserId) {
      throw new ForbiddenException('Anda tidak berwenang mengakses data peserta batch lembaga lain.');
    }

    const participants = batch.enrollments.map((enr) => ({
      enrollmentId: enr.id,
      talentId: enr.talentId,
      fullName: enr.talent.fullName,
      nik: enr.talent.nik,
      phone: enr.talent.phone || undefined,
      email: enr.talent.user?.email || '',
      avatarUrl: enr.talent.avatarUrl || undefined,
      selectionStatus: enr.selectionStatus,
      isPassed: enr.selectionStatus === BatchEnrollmentStatus.COMPLETED,
      finalScore: enr.finalScore ? Number(enr.finalScore) : undefined,
      certificateNumber: enr.certificateNumber || undefined,
      bnspCertificateNumber: enr.bnspCertificateNumber || undefined,
      enrolledAt: enr.createdAt.toISOString(),
      completedAt: enr.completedAt?.toISOString() || undefined,
    }));

    const totalCompleted = participants.filter(
      (p) => p.selectionStatus === BatchEnrollmentStatus.COMPLETED,
    ).length;

    return {
      status: 'success',
      data: {
        batchId: batch.id,
        batchName: batch.batchName,
        programTitle: batch.program.title,
        targetSkills: batch.program.targetSkills,
        quota: batch.quota,
        totalEnrolled: participants.length,
        totalCompleted,
        participants,
      },
    };
  }

  async executeBulkGraduation(
    batchId: string,
    actorUserId: string,
    dto: BulkGraduationDto,
    isDisnaker: boolean,
  ) {
    const batch = await this.prisma.trainingBatch.findUnique({
      where: { id: batchId },
      include: {
        program: {
          include: {
            provider: true,
          },
        },
        enrollments: {
          include: { talent: true },
        },
      },
    });

    if (!batch) {
      throw new NotFoundException('Batch cohort pelatihan tidak ditemukan.');
    }

    if (!isDisnaker && batch.program.providerId !== actorUserId) {
      throw new ForbiddenException('Anda tidak berwenang mengeksekusi kelulusan batch lembaga lain.');
    }

    if (dto.participants.length === 0) {
      throw new BadRequestException('Daftar peserta kelulusan tidak boleh kosong.');
    }

    const targetSkills = Array.isArray(batch.program.targetSkills)
      ? (batch.program.targetSkills as any[])
      : [];

    const defaultPrefix =
      dto.certificatePrefix?.trim() ||
      `CERT-MT-${new Date().getFullYear()}-${batch.batchNumber}`;
    let passedCount = 0;
    let failedCount = 0;

    // EKSEKUSI ATOMIC MASS TRANSACTION
    await this.prisma.$transaction(async (tx) => {
      for (let i = 0; i < dto.participants.length; i++) {
        const item = dto.participants[i];
        const existingEnrollment = batch.enrollments.find((e) => e.talentId === item.talentId);

        if (!existingEnrollment) {
          continue;
        }

        if (item.isPassed) {
          passedCount++;

          // 1. Generate Nomor Sertifikat Berurut Otomatis (jika tidak disediakan manual)
          const seq = String(passedCount).padStart(3, '0');
          let generatedCertNum = item.certificateNumber?.trim() || `${defaultPrefix}-${seq}`;

          // Cek proteksi keunikan nomor sertifikat (Collision-proof guarantee)
          const existingCert = await tx.trainingEnrollment.findUnique({
            where: { certificateNumber: generatedCertNum },
          });
          if (existingCert && existingCert.id !== existingEnrollment.id) {
            generatedCertNum = `${defaultPrefix}-${batch.id.slice(0, 4).toUpperCase()}-${seq}`;
            const existingCert2 = await tx.trainingEnrollment.findUnique({
              where: { certificateNumber: generatedCertNum },
            });
            if (existingCert2 && existingCert2.id !== existingEnrollment.id) {
              generatedCertNum = `${defaultPrefix}-${Date.now().toString().slice(-4)}-${seq}`;
            }
          }

          const qrHash = crypto
            .createHash('sha256')
            .update(`${generatedCertNum}-${item.talentId}-${Date.now()}`)
            .digest('hex');

          // 2. Update Status Pendaftaran Batch menjadi COMPLETED
          await tx.trainingEnrollment.update({
            where: { id: existingEnrollment.id },
            data: {
              status: TrainingEnrollmentStatus.COMPLETED,
              selectionStatus: BatchEnrollmentStatus.COMPLETED,
              finalScore: item.finalScore ?? 85,
              certificateNumber: generatedCertNum,
              bnspCertificateNumber: item.bnspCertificateNumber?.trim() || null,
              qrCodeHash: qrHash,
              completedAt: new Date(),
            },
          });

          // 3. ATOMIC AUTO-SKILL INJECTION KE TALENT.SKILLS (THE CLOSED-LOOP SYNERGY)
          const talent = await tx.talent.findUnique({
            where: { id: item.talentId },
          });

          if (talent && targetSkills.length > 0) {
            const currentSkills = (Array.isArray(talent.skills) ? talent.skills : []) as any[];
            const updatedSkills = [...currentSkills];

            for (const skill of targetSkills) {
              const skillName = typeof skill === 'string' ? skill : skill.name;
              const skillLevel = typeof skill === 'object' ? skill.level || 'EXPERT' : 'EXPERT';

              const injectedSkill = {
                name: skillName.trim(),
                level: skillLevel,
                isLmsVerified: true,
                certificateNumber: item.bnspCertificateNumber?.trim() || generatedCertNum,
                verifiedAt: new Date().toISOString(),
              };

              const existingIdx = updatedSkills.findIndex(
                (s) =>
                  (typeof s === 'string' ? s : s.name)?.toLowerCase() === skillName.toLowerCase(),
              );

              if (existingIdx >= 0) {
                updatedSkills[existingIdx] = {
                  ...updatedSkills[existingIdx],
                  ...injectedSkill,
                };
              } else {
                updatedSkills.push(injectedSkill);
              }
            }

            await tx.talent.update({
              where: { id: item.talentId },
              data: { skills: updatedSkills },
            });
          }
        } else {
          failedCount++;
          // Update Status Tidak Lulus
          await tx.trainingEnrollment.update({
            where: { id: existingEnrollment.id },
            data: {
              status: TrainingEnrollmentStatus.FAILED,
              selectionStatus: BatchEnrollmentStatus.DROPPED_OUT,
              finalScore: item.finalScore ?? 45,
            },
          });
        }
      }
    });

    this.logger.log(
      `[Mass Graduation Engine] Batch "${batch.batchName}" (${batch.program.title}) diproses: ${passedCount} LULUS (Auto-Skill Injected), ${failedCount} GAGAL/DROPOUT.`,
    );

    return {
      status: 'success',
      message: `Kelulusan massal batch "${batch.batchName}" berhasil disahkan! ${passedCount} talenta resmi lulus dan keahlian baru otomatis terinjeksi ke profil mereka.`,
      data: {
        batchId: batch.id,
        batchName: batch.batchName,
        passedCount,
        failedCount,
        totalProcessed: passedCount + failedCount,
      },
    };
  }
}
