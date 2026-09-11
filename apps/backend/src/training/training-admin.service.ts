import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CurateProgramDto } from './dto/curate-program.dto';
import { ProgramApprovalStatus, TrainingProgramStatus } from '@prisma/client';

@Injectable()
export class TrainingAdminService {
  private readonly logger = new Logger(TrainingAdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getPendingProgramCurations() {
    const list = await this.prisma.trainingProgram.findMany({
      where: {
        approvalStatus: ProgramApprovalStatus.PENDING_APPROVAL,
      },
      include: {
        provider: true,
        batches: {
          orderBy: { batchNumber: 'asc' },
        },
        author: {
          select: { email: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return {
      status: 'success',
      total: list.length,
      data: list,
    };
  }

  async getAllPrograms(filter?: {
    approvalStatus?: ProgramApprovalStatus;
    status?: TrainingProgramStatus;
  }) {
    const where: any = {};
    if (filter?.approvalStatus) where.approvalStatus = filter.approvalStatus;
    if (filter?.status) where.status = filter.status;

    const list = await this.prisma.trainingProgram.findMany({
      where,
      include: {
        provider: true,
        batches: true,
        author: {
          select: { email: true },
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

  async curateProgram(programId: string, adminUserId: string, dto: CurateProgramDto) {
    const program = await this.prisma.trainingProgram.findUnique({
      where: { id: programId },
      include: { provider: true },
    });

    if (!program) {
      throw new NotFoundException('Program pelatihan tidak ditemukan.');
    }

    const isApproved = dto.status === ProgramApprovalStatus.APPROVED;
    const newStatus = isApproved
      ? TrainingProgramStatus.PUBLISHED
      : TrainingProgramStatus.DRAFT;

    const updated = await this.prisma.trainingProgram.update({
      where: { id: programId },
      data: {
        approvalStatus: dto.status,
        approvalNotes: dto.notes,
        status: newStatus,
      },
      include: { provider: true, batches: true },
    });

    this.logger.log(
      `[Tier-2 Kurasi] Disnaker Admin (${adminUserId}) menyelesaikan kurasi program "${program.title}" (${program.programCode}): Keputusan ${dto.status}`,
    );

    return {
      status: 'success',
      message: isApproved
        ? `Program "${program.title}" disahkan dan resmi tayang di Katalog Skillhub Daerah!`
        : `Program "${program.title}" ditolak dengan catatan resmi.`,
      data: updated,
    };
  }
}
