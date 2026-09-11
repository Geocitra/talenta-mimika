import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateTrainingProviderProfileDto } from './dto/update-training-provider-profile.dto';
import { VerifyTrainingProviderDto } from './dto/verify-training-provider.dto';
import { CreateProgramStudioDto } from './dto/create-program-studio.dto';
import { CreateBatchDto, UpdateBatchDto } from './dto/create-batch.dto';
import {
  VerificationStatus,
  InstitutionType,
  ProgramApprovalStatus,
  TrainingProgramStatus,
} from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class TrainingProviderService {
  private readonly logger = new Logger(TrainingProviderService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ==================== KANAL TRAINING PROVIDER ====================
  async getMyProfile(providerId: string) {
    const provider = await this.prisma.trainingProvider.findUnique({
      where: { id: providerId },
      include: {
        user: {
          select: {
            email: true,
            isVerified: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            programs: true,
          },
        },
      },
    });

    if (!provider) {
      throw new NotFoundException('Profil lembaga pelatihan tidak ditemukan.');
    }

    return {
      status: 'success',
      data: provider,
    };
  }

  async updateMyProfile(providerId: string, dto: UpdateTrainingProviderProfileDto) {
    const existing = await this.prisma.trainingProvider.findUnique({
      where: { id: providerId },
    });

    if (!existing) {
      throw new NotFoundException('Profil lembaga pelatihan tidak ditemukan.');
    }

    const updated = await this.prisma.trainingProvider.update({
      where: { id: providerId },
      data: {
        institutionName: dto.institutionName !== undefined ? dto.institutionName : existing.institutionName,
        institutionType: dto.institutionType !== undefined ? dto.institutionType : existing.institutionType,
        vinNumber: dto.vinNumber !== undefined ? dto.vinNumber : existing.vinNumber,
        bnspLicenseNumber: dto.bnspLicenseNumber !== undefined ? dto.bnspLicenseNumber : existing.bnspLicenseNumber,
        accreditation: dto.accreditation !== undefined ? dto.accreditation : existing.accreditation,
        picName: dto.picName !== undefined ? dto.picName : existing.picName,
        picRole: dto.picRole !== undefined ? dto.picRole : existing.picRole,
        picPhone: dto.picPhone !== undefined ? dto.picPhone : existing.picPhone,
        picEmail: dto.picEmail !== undefined ? dto.picEmail : existing.picEmail,
        address: dto.address !== undefined ? dto.address : existing.address,
        locationLat: dto.locationLat !== undefined ? dto.locationLat : existing.locationLat,
        locationLng: dto.locationLng !== undefined ? dto.locationLng : existing.locationLng,
        institutionBio: dto.institutionBio !== undefined ? dto.institutionBio : existing.institutionBio,
        websiteUrl: dto.websiteUrl !== undefined ? dto.websiteUrl : existing.websiteUrl,
        logoUrl: dto.logoUrl !== undefined ? dto.logoUrl : existing.logoUrl,
        legalDocUrl: dto.legalDocUrl !== undefined ? dto.legalDocUrl : existing.legalDocUrl,
      },
    });

    return {
      status: 'success',
      message: 'Profil lembaga pelatihan berhasil diperbarui.',
      data: updated,
    };
  }

  // ==================== STUDIO PROGRAM PELATIHAN ====================
  async createProgramStudio(providerUserId: string, dto: CreateProgramStudioDto) {
    const provider = await this.prisma.trainingProvider.findUnique({
      where: { id: providerUserId },
    });

    if (!provider) {
      throw new NotFoundException('Profil lembaga pelatihan tidak ditemukan.');
    }

    // INVARIAN TIER-1 GUARD: Lembaga wajib APPROVED oleh Disnaker
    if (provider.verificationStatus !== VerificationStatus.APPROVED) {
      throw new ForbiddenException(
        'Lembaga pelatihan Anda belum berstatus APPROVED oleh Disnakertrans Mimika. Anda belum dapat membuat program pelatihan.',
      );
    }

    // Generate Kode Unik Program (e.g. #MT-WELD-A19F)
    const catPrefix = dto.category.substring(0, 4).toUpperCase();
    const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
    const programCode = `#MT-${catPrefix}-${randomHex}`;

    const approvalStatus = dto.submitForApproval
      ? ProgramApprovalStatus.PENDING_APPROVAL
      : ProgramApprovalStatus.DRAFT;

    const program = await this.prisma.trainingProgram.create({
      data: {
        providerId: provider.id,
        createdBy: providerUserId,
        title: dto.title,
        programCode,
        providerName: provider.institutionName,
        category: dto.category,
        subCategory: dto.subCategory,
        certificateType: dto.certificateType,
        deliveryMode: dto.deliveryMode,
        description: dto.description,
        syllabus: dto.syllabus,
        requirements: dto.requirements ? (dto.requirements as any) : [],
        targetSkills: dto.targetSkills as any,
        durationDays: dto.durationDays || 20,
        totalLessonHours: dto.totalLessonHours || 160,
        coverImageUrl: dto.coverImageUrl,
        approvalStatus,
        status: TrainingProgramStatus.DRAFT,
      },
      include: { provider: true, batches: true },
    });

    this.logger.log(`[Studio Program] Lembaga ${provider.institutionName} membuat program "${program.title}" (${program.programCode})`);

    return {
      status: 'success',
      message: dto.submitForApproval
        ? `Program "${program.title}" berhasil dibuat dan diajukan ke Meja Kurasi Tier-2 Disnakertrans Mimika.`
        : `Draf program "${program.title}" berhasil disimpan.`,
      data: program,
    };
  }

  async getMyPrograms(providerUserId: string) {
    const programs = await this.prisma.trainingProgram.findMany({
      where: { providerId: providerUserId },
      include: {
        provider: true,
        batches: {
          orderBy: { batchNumber: 'asc' },
        },
        _count: {
          select: { enrollments: true },
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

  async getProgramDetail(providerUserId: string, programId: string) {
    const program = await this.prisma.trainingProgram.findUnique({
      where: { id: programId },
      include: {
        provider: true,
        batches: {
          orderBy: { batchNumber: 'asc' },
        },
        sessions: {
          orderBy: { sessionOrder: 'asc' },
        },
      },
    });

    if (!program) {
      throw new NotFoundException('Program pelatihan tidak ditemukan.');
    }

    if (program.providerId !== providerUserId) {
      throw new ForbiddenException('Anda tidak berwenang mengakses data program lembaga lain.');
    }

    return {
      status: 'success',
      data: program,
    };
  }

  // ==================== MANAJEMEN BATCH COHORT ====================
  async createBatch(providerUserId: string, programId: string, dto: CreateBatchDto) {
    const provider = await this.prisma.trainingProvider.findUnique({
      where: { id: providerUserId },
    });

    if (!provider || provider.verificationStatus !== VerificationStatus.APPROVED) {
      throw new ForbiddenException('Akses ditolak: Lembaga belum terverifikasi sah.');
    }

    const program = await this.prisma.trainingProgram.findUnique({
      where: { id: programId },
      include: { batches: true },
    });

    if (!program) {
      throw new NotFoundException('Program pelatihan tidak ditemukan.');
    }

    if (program.providerId !== provider.id) {
      throw new ForbiddenException('Anda tidak berwenang membuka batch untuk program lembaga lain.');
    }

    const batchNumber = program.batches.length + 1;
    const venueAddress = dto.venueAddress || provider.address;
    const venueLat = dto.venueLat ?? provider.locationLat;
    const venueLng = dto.venueLng ?? provider.locationLng;

    const batch = await this.prisma.trainingBatch.create({
      data: {
        programId,
        batchName: dto.batchName,
        batchNumber,
        fundingType: dto.fundingType,
        priceAmount: dto.priceAmount,
        trainingMethod: dto.trainingMethod,
        quota: dto.quota,
        welfareBenefits: dto.welfareBenefits ? (dto.welfareBenefits as any) : [],
        registrationStart: new Date(dto.registrationStart),
        registrationEnd: new Date(dto.registrationEnd),
        trainingStart: new Date(dto.trainingStart),
        trainingEnd: new Date(dto.trainingEnd),
        venueAddress,
        venueLat,
        venueLng,
        isOpen: true,
      },
    });

    this.logger.log(`[Batch Cohort] Dibuka batch "${batch.batchName}" pada program ${program.title} (kuota: ${batch.quota})`);

    return {
      status: 'success',
      message: `Batch "${batch.batchName}" berhasil dibuka dengan kuota ${batch.quota} kursi.`,
      data: batch,
    };
  }

  async updateBatch(providerUserId: string, batchId: string, dto: UpdateBatchDto) {
    const batch = await this.prisma.trainingBatch.findUnique({
      where: { id: batchId },
      include: { program: true },
    });

    if (!batch) {
      throw new NotFoundException('Batch cohort tidak ditemukan.');
    }

    if (batch.program.providerId !== providerUserId) {
      throw new ForbiddenException('Anda tidak berwenang memperbarui batch milik lembaga lain.');
    }

    const updateData: any = {};
    if (dto.batchName !== undefined) updateData.batchName = dto.batchName;
    if (dto.fundingType !== undefined) updateData.fundingType = dto.fundingType;
    if (dto.priceAmount !== undefined) updateData.priceAmount = dto.priceAmount;
    if (dto.trainingMethod !== undefined) updateData.trainingMethod = dto.trainingMethod;
    if (dto.quota !== undefined) updateData.quota = dto.quota;
    if (dto.welfareBenefits !== undefined) updateData.welfareBenefits = dto.welfareBenefits;
    if (dto.registrationStart !== undefined) updateData.registrationStart = new Date(dto.registrationStart);
    if (dto.registrationEnd !== undefined) updateData.registrationEnd = new Date(dto.registrationEnd);
    if (dto.trainingStart !== undefined) updateData.trainingStart = new Date(dto.trainingStart);
    if (dto.trainingEnd !== undefined) updateData.trainingEnd = new Date(dto.trainingEnd);
    if (dto.venueAddress !== undefined) updateData.venueAddress = dto.venueAddress;
    if (dto.venueLat !== undefined) updateData.venueLat = dto.venueLat;
    if (dto.venueLng !== undefined) updateData.venueLng = dto.venueLng;
    if (dto.isOpen !== undefined) updateData.isOpen = dto.isOpen;

    const updated = await this.prisma.trainingBatch.update({
      where: { id: batchId },
      data: updateData,
    });

    return {
      status: 'success',
      message: `Batch "${updated.batchName}" berhasil diperbarui.`,
      data: updated,
    };
  }

  async getMyBatches(providerUserId: string) {
    const batches = await this.prisma.trainingBatch.findMany({
      where: {
        program: {
          providerId: providerUserId,
        },
      },
      include: {
        program: {
          select: {
            id: true,
            title: true,
            programCode: true,
            category: true,
            certificateType: true,
            approvalStatus: true,
            status: true,
          },
        },
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      status: 'success',
      total: batches.length,
      data: batches,
    };
  }

  // ==================== KANAL DISNAKER ADMIN ====================
  async getPendingProviders() {
    const pendingList = await this.prisma.trainingProvider.findMany({
      where: { verificationStatus: VerificationStatus.PENDING },
      include: {
        user: {
          select: { email: true, isVerified: true, createdAt: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      status: 'success',
      total: pendingList.length,
      data: pendingList,
    };
  }

  async getAllProviders(filter?: { status?: VerificationStatus; type?: InstitutionType }) {
    const where: any = {};
    if (filter?.status) where.verificationStatus = filter.status;
    if (filter?.type) where.institutionType = filter.type;

    const list = await this.prisma.trainingProvider.findMany({
      where,
      include: {
        user: {
          select: { email: true, isVerified: true, createdAt: true },
        },
        _count: {
          select: { programs: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      status: 'success',
      total: list.length,
      data: list,
    };
  }

  async verifyProvider(providerId: string, adminId: string, dto: VerifyTrainingProviderDto) {
    const provider = await this.prisma.trainingProvider.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      throw new NotFoundException('Data lembaga pelatihan tidak ditemukan.');
    }

    if (dto.status === VerificationStatus.PENDING) {
      throw new BadRequestException('Keputusan harus berupa APPROVED atau REJECTED.');
    }

    const verified = await this.prisma.trainingProvider.update({
      where: { id: providerId },
      data: {
        verificationStatus: dto.status,
        verificationNotes: dto.notes !== undefined ? dto.notes : provider.verificationNotes,
        verifiedBy: adminId,
        verifiedAt: new Date(),
      },
    });

    this.logger.log(`[Tier-1 Audit] Provider ${provider.institutionName} status updated to ${dto.status} by Admin ${adminId}`);

    return {
      status: 'success',
      message: `Lembaga pelatihan ${provider.institutionName} berhasil di-${dto.status.toLowerCase()}.`,
      data: verified,
    };
  }
}
