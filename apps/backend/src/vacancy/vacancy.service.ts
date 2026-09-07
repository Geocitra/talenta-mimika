import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobVacancyDto } from './dto/create-job-vacancy.dto';
import { UpdateJobVacancyDto } from './dto/update-job-vacancy.dto';
import { VacancyStatus, VerificationStatus } from '@prisma/client';

@Injectable()
export class VacancyService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================
  // USE CASE 1: BUAT KEBUTUHAN LOWONGAN BARU (Role: EMPLOYER)
  // ============================================================
  async createVacancy(employerId: string, dto: CreateJobVacancyDto) {
    // Business Invariant: Periksa apakah perusahaan sudah terverifikasi resmi oleh Disnaker
    const employer = await this.prisma.employer.findUnique({
      where: { id: employerId },
    });

    if (!employer) {
      throw new NotFoundException('Profil perusahaan tidak ditemukan.');
    }

    if (employer.verificationStatus !== VerificationStatus.APPROVED) {
      throw new ForbiddenException(
        'Perusahaan Anda belum berstatus APPROVED oleh Disnakertrans Mimika. Anda belum dapat menerbitkan lowongan.',
      );
    }

    const vacancy = await this.prisma.jobVacancy.create({
      data: {
        employerId,
        title: dto.title,
        taskDescription: dto.taskDescription,
        projectDuration: dto.projectDuration,
        requiredSkills: dto.requiredSkills,
        minEducation: dto.minEducation,
        minExperienceYears: dto.minExperienceYears,
        allowEquivalence: dto.allowEquivalence ?? true,
        jobLocationLat: dto.jobLocationLat ?? employer.locationLat,
        jobLocationLng: dto.jobLocationLng ?? employer.locationLng,
        status: VacancyStatus.OPEN,
      },
    });

    return {
      status: 'success',
      message: 'Kebutuhan lowongan pekerjaan berhasil diterbitkan dan siap disodorkan ke AI Matching Engine.',
      data: vacancy,
    };
  }

  // ============================================================
  // USE CASE 2: DAFTAR LOWONGAN MILIK SAYA (Role: EMPLOYER)
  // ============================================================
  async getMyVacancies(employerId: string) {
    const list = await this.prisma.jobVacancy.findMany({
      where: { employerId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      status: 'success',
      total: list.length,
      data: list,
    };
  }

  // ============================================================
  // USE CASE 3: DETAIL LOWONGAN SPESIFIK
  // ============================================================
  async getVacancyById(id: string) {
    const vacancy = await this.prisma.jobVacancy.findUnique({
      where: { id },
      include: {
        employer: {
          select: {
            companyName: true,
            industrySector: true,
            address: true,
            locationLat: true,
            locationLng: true,
          },
        },
      },
    });

    if (!vacancy) {
      throw new NotFoundException('Lowongan pekerjaan tidak ditemukan.');
    }

    return {
      status: 'success',
      data: vacancy,
    };
  }

  // ============================================================
  // USE CASE 4: PERBARUI DETAIL LOWONGAN (Role: EMPLOYER)
  // ============================================================
  async updateVacancy(id: string, employerId: string, dto: UpdateJobVacancyDto) {
    const vacancy = await this.prisma.jobVacancy.findUnique({
      where: { id },
    });

    if (!vacancy) {
      throw new NotFoundException('Lowongan pekerjaan tidak ditemukan.');
    }

    if (vacancy.employerId !== employerId) {
      throw new ForbiddenException('Anda tidak berwenang mengedit lowongan milik perusahaan lain.');
    }

    const updated = await this.prisma.jobVacancy.update({
      where: { id },
      data: {
        title: dto.title,
        taskDescription: dto.taskDescription,
        projectDuration: dto.projectDuration,
        requiredSkills: dto.requiredSkills,
        minEducation: dto.minEducation,
        minExperienceYears: dto.minExperienceYears,
        allowEquivalence: dto.allowEquivalence,
        jobLocationLat: dto.jobLocationLat,
        jobLocationLng: dto.jobLocationLng,
        status: dto.status,
      },
    });

    return {
      status: 'success',
      message: 'Detail lowongan berhasil diperbarui.',
      data: updated,
    };
  }

  // ============================================================
  // USE CASE 5: TUTUP LOWONGAN (Role: EMPLOYER)
  // ============================================================
  async closeVacancy(id: string, employerId: string) {
    const vacancy = await this.prisma.jobVacancy.findUnique({
      where: { id },
    });

    if (!vacancy) {
      throw new NotFoundException('Lowongan pekerjaan tidak ditemukan.');
    }

    if (vacancy.employerId !== employerId) {
      throw new ForbiddenException('Anda tidak berwenang menutup lowongan milik perusahaan lain.');
    }

    const closed = await this.prisma.jobVacancy.update({
      where: { id },
      data: { status: VacancyStatus.CLOSED },
    });

    return {
      status: 'success',
      message: 'Lowongan pekerjaan resmi ditutup.',
      data: closed,
    };
  }

  // ============================================================
  // USE CASE 6: SEMUA LOWONGAN AKTIF (Katalog Publik / Disnaker)
  // ============================================================
  async getAllOpenVacancies() {
    const list = await this.prisma.jobVacancy.findMany({
      where: { status: VacancyStatus.OPEN },
      include: {
        employer: {
          select: {
            companyName: true,
            industrySector: true,
            address: true,
          },
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
}
