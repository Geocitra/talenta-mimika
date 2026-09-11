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
  // USE CASE 2: PERBARUI PROFIL SENDIRI (Role: EMPLOYER)
  // ============================================================
  async updateMyProfile(userId: string, dto: UpdateEmployerProfileDto) {
    const employer = await this.prisma.employer.findUnique({
      where: { id: userId },
    });

    if (!employer) {
      throw new NotFoundException('Profil perusahaan tidak ditemukan.');
    }

    // Invarian Skala Tenaga Kerja: hitung median otomatis jika companySize diubah
    const medianMap: Record<string, number> = {
      SCALE_1_10: 5,
      SCALE_11_50: 30,
      SCALE_51_200: 125,
      SCALE_201_500: 350,
      SCALE_501_1000: 750,
      SCALE_OVER_1000: 2500,
    };

    let calculatedEmployeeCount = employer.employeeCount;
    if (dto.employeeCount !== undefined) {
      calculatedEmployeeCount = dto.employeeCount;
    } else if (dto.companySize && medianMap[dto.companySize]) {
      calculatedEmployeeCount = medianMap[dto.companySize];
    }

    // Perusahaan dilarang keras mengubah status verifikasinya secara mandiri!
    const updatedEmployer = await this.prisma.employer.update({
      where: { id: userId },
      data: {
        companyName: dto.companyName ?? employer.companyName,
        brandName: dto.brandName !== undefined ? dto.brandName : employer.brandName,
        industrySector: dto.industrySector ?? employer.industrySector,
        companySize: dto.companySize ?? employer.companySize,
        employeeCount: calculatedEmployeeCount,
        address: dto.address ?? employer.address,
        locationLat: dto.locationLat ?? employer.locationLat,
        locationLng: dto.locationLng ?? employer.locationLng,
        companyBio: dto.companyBio ?? employer.companyBio,
        websiteUrl: dto.websiteUrl !== undefined ? dto.websiteUrl : employer.websiteUrl,
        npwpNumber: dto.npwpNumber !== undefined ? dto.npwpNumber : employer.npwpNumber,
        logoUrl: dto.logoUrl !== undefined ? dto.logoUrl : employer.logoUrl,
        nibDocUrl: dto.nibDocUrl !== undefined ? dto.nibDocUrl : employer.nibDocUrl,
        picName: dto.picName !== undefined ? dto.picName : employer.picName,
        picRole: dto.picRole !== undefined ? dto.picRole : employer.picRole,
        picPhone: dto.picPhone !== undefined ? dto.picPhone : employer.picPhone,
        picEmail: dto.picEmail !== undefined ? dto.picEmail : employer.picEmail,
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
        verificationNotes: dto.notes !== undefined ? dto.notes : employer.verificationNotes,
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
