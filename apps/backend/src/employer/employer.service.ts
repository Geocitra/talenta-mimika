import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateEmployerProfileDto } from './dto/update-employer-profile.dto';
import { VerifyEmployerDto } from './dto/verify-employer.dto';
import { VerificationStatus } from '@prisma/client';

@Injectable()
export class EmployerService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================
  // USE CASE 1: AMBIL PROFIL SENDIRI (Role: EMPLOYER)
  // ============================================================
  async getMyProfile(userId: string) {
    const employer = await this.prisma.employer.findUnique({
      where: { id: userId },
      include: {
        user: {
          select: { email: true, isVerified: true, role: true },
        },
      },
    });

    if (!employer) {
      throw new NotFoundException('Profil perusahaan tidak ditemukan.');
    }

    return {
      status: 'success',
      data: employer,
    };
  }

  // ============================================================
  // USE CASE 2: PERBARUI PROFIL SENDIRI (Role: EMPLOYER)
  // ============================================================
  async updateMyProfile(userId: string, dto: UpdateEmployerProfileDto) {
    const employer = await this.prisma.employer.findUnique({
      where: { id: userId },
    });

    if (!employer) {
      throw new NotFoundException('Profil perusahaan tidak ditemukan.');
    }

    // Perusahaan dilarang keras mengubah status verifikasinya secara mandiri!
    const updatedEmployer = await this.prisma.employer.update({
      where: { id: userId },
      data: {
        companyName: dto.companyName ?? employer.companyName,
        industrySector: dto.industrySector ?? employer.industrySector,
        employeeCount: dto.employeeCount ?? employer.employeeCount,
        address: dto.address ?? employer.address,
        locationLat: dto.locationLat ?? employer.locationLat,
        locationLng: dto.locationLng ?? employer.locationLng,
        companyBio: dto.companyBio ?? employer.companyBio,
      },
    });

    return {
      status: 'success',
      message: 'Profil perusahaan berhasil diperbarui.',
      data: updatedEmployer,
    };
  }

  // ============================================================
  // USE CASE 3: DAFTAR PERUSAHAAN MENUNGGU VERIFIKASI (Role: DISNAKER_ADMIN)
  // ============================================================
  async getPendingEmployers() {
    const pendingList = await this.prisma.employer.findMany({
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

  // ============================================================
  // USE CASE 4: KEPUTUSAN VERIFIKASI DISNAKER (Role: DISNAKER_ADMIN)
  // ============================================================
  async verifyEmployer(employerId: string, adminId: string, dto: VerifyEmployerDto) {
    const employer = await this.prisma.employer.findUnique({
      where: { id: employerId },
    });

    if (!employer) {
      throw new NotFoundException('Data perusahaan tidak ditemukan.');
    }

    if (dto.status === VerificationStatus.PENDING) {
      throw new BadRequestException('Keputusan harus berupa APPROVED atau REJECTED.');
    }

    const verifiedEmployer = await this.prisma.employer.update({
      where: { id: employerId },
      data: {
        verificationStatus: dto.status,
        verifiedBy: adminId,
        verifiedAt: new Date(),
      },
    });

    return {
      status: 'success',
      message: `Perusahaan ${employer.companyName} berhasil di-${dto.status.toLowerCase()}.`,
      data: verifiedEmployer,
    };
  }
}
