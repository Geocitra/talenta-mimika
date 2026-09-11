import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobVacancyDto } from './dto/create-job-vacancy.dto';
import { UpdateJobVacancyDto } from './dto/update-job-vacancy.dto';
import { ResolveVacancyOutcomeDto } from './dto/resolve-vacancy-outcome.dto';
import { VacancyStatus, VerificationStatus, OpportunityType, WorkZone, WorkSchedule, EmploymentContractType } from '@prisma/client';

@Injectable()
export class VacancyService {
  private readonly logger = new Logger(VacancyService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================================
  // USE CASE 1: BUAT KEBUTUHAN LOWONGAN / MAGANG BARU (Role: EMPLOYER)
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

    // 1. Aksioma Dualitas Peluang (The Opportunity Duality Axiom)
    const oppType = dto.opportunityType || OpportunityType.JOB;
    let minExperienceYears = dto.minExperienceYears ?? 0;

    if (oppType === OpportunityType.INTERNSHIP) {
      // Magang dilarang mensyaratkan jam terbang kerja!
      minExperienceYears = 0;
    } else if (oppType === OpportunityType.JOB) {
      // Validasi rentang gaji UMK jika diisi
      if (dto.salaryMin && dto.salaryMax && Number(dto.salaryMax) < Number(dto.salaryMin)) {
        throw new BadRequestException('Gaji maksimum tidak boleh lebih kecil dari gaji minimum.');
      }
    }

    // 2. Geospasial: Fallback ke koordinat kantor jika di tempat yang sama
    const isSameAsOffice = dto.isSameAsOfficeLocation ?? true;
    let jobLat = dto.jobLocationLat;
    let jobLng = dto.jobLocationLng;

    if (isSameAsOffice || (!jobLat && !jobLng)) {
      jobLat = employer.locationLat ?? undefined;
      jobLng = employer.locationLng ?? undefined;
    }

    // 3. Afirmasi Vokasi Daerah (Default allowEquivalence = true)
    const allowEquiv = dto.allowEquivalence ?? true;

    // 4. Kalkulasi Masa Aktif Lowongan (Time-To-Live / TTL Default: 14 Hari)
    const activeDays = dto.activeDaysDuration && dto.activeDaysDuration > 0 ? dto.activeDaysDuration : 14;
    const expiresAt = new Date(Date.now() + activeDays * 24 * 60 * 60 * 1000);

    // 5. Tentukan Tipe Kontrak & Format Otomatis (PP 35/2021)
    let contractType: EmploymentContractType = dto.contractType || EmploymentContractType.PKWT;
    let contractDurationMonths: number | null = dto.contractDurationMonths ?? 12;
    let projectDurationText = dto.projectDuration?.trim();

    if (oppType === OpportunityType.INTERNSHIP) {
      contractType = EmploymentContractType.PEMAGANGAN;
      contractDurationMonths = dto.contractDurationMonths || 6;
      projectDurationText = `${contractDurationMonths} Bulan (Pemagangan Vokasi)`;
    } else {
      if (contractType === EmploymentContractType.PKWTT) {
        contractDurationMonths = null;
        projectDurationText = 'Karyawan Tetap (PKWTT)';
      } else if (contractType === EmploymentContractType.HARIAN_LEPAS) {
        contractDurationMonths = dto.contractDurationMonths || 1;
        projectDurationText = `${contractDurationMonths} Bulan (Pekerja Harian Lepas)`;
      } else {
        // Default: PKWT
        contractType = EmploymentContractType.PKWT;
        contractDurationMonths = dto.contractDurationMonths || 12;
        projectDurationText = projectDurationText || `${contractDurationMonths} Bulan (Kontrak PKWT Proyek)`;
      }
    }

    const vacancy = await this.prisma.jobVacancy.create({
      data: {
        employerId,
        title: dto.title,
        opportunityType: oppType,
        contractType,
        contractDurationMonths,
        quota: dto.quota && dto.quota > 0 ? dto.quota : 1,

        // Welfare & Finansial (Opsional / Fleksibel)
        salaryMin: dto.salaryMin !== undefined ? dto.salaryMin : undefined,
        salaryMax: dto.salaryMax !== undefined ? dto.salaryMax : undefined,
        isSalaryDisclosed: dto.isSalaryDisclosed ?? true,
        stipendAmount: dto.stipendAmount !== undefined ? dto.stipendAmount : undefined,
        benefits: dto.benefits ? (dto.benefits as any) : [],
        workTools: dto.workTools ? (dto.workTools as any) : [],

        // Geografis & Pola Kerja
        isSameAsOfficeLocation: isSameAsOffice,
        workZone: dto.workZone || WorkZone.TIMIKA_KOTA,
        workSchedule: dto.workSchedule || WorkSchedule.NORMAL_DAY,
        jobLocationLat: jobLat,
        jobLocationLng: jobLng,

        // Khusus Magang
        skillsGained: dto.skillsGained ? (dto.skillsGained as any) : [],
        mentorName: dto.mentorName,
        mentorRole: dto.mentorRole,
        hasAbsorptionOpportunity: dto.hasAbsorptionOpportunity ?? false,

        // Kualifikasi & Deskripsi
        taskDescription: dto.taskDescription,
        projectDuration: projectDurationText,
        requiredSkills: dto.requiredSkills ? (dto.requiredSkills as any) : [],
        mandatoryCerts: dto.mandatoryCerts ? (dto.mandatoryCerts as any) : [],
        preferredMajors: dto.preferredMajors ? (dto.preferredMajors as any) : [],
        minEducation: dto.minEducation,
        minExperienceYears: minExperienceYears,
        allowEquivalence: allowEquiv,
        status: VacancyStatus.OPEN,
        activeDaysDuration: activeDays,
        expiresAt: expiresAt,
      },
    });

    return {
      status: 'success',
      message: `${oppType === OpportunityType.INTERNSHIP ? 'Lowongan pemagangan vokasi' : 'Kebutuhan lowongan pekerjaan'} berhasil diterbitkan dan siap disodorkan ke AI Matching Engine.`,
      data: vacancy,
    };
  }

  // ============================================================
  // USE CASE 2: DAFTAR LOWONGAN MILIK SAYA (Role: EMPLOYER)
  // ============================================================
  async getMyVacancies(employerId: string) {
    await this.checkAndExpireVacancies();

    const list = await this.prisma.jobVacancy.findMany({
      where: { employerId },
      include: {
        _count: {
          select: { approaches: true },
        },
        approaches: {
          where: { status: 'HIRED' },
          include: {
            talent: {
              select: { fullName: true, avatarUrl: true },
            },
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
            logoUrl: true,
            nib: true,
            industrySector: true,
            address: true,
            picName: true,
            picPhone: true,
            locationLat: true,
            locationLng: true,
            verificationStatus: true,
          },
        },
        _count: {
          select: { approaches: true },
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
        opportunityType: dto.opportunityType,
        quota: dto.quota,
        salaryMin: dto.salaryMin,
        salaryMax: dto.salaryMax,
        isSalaryDisclosed: dto.isSalaryDisclosed,
        stipendAmount: dto.stipendAmount,
        benefits: dto.benefits ? (dto.benefits as any) : undefined,
        workTools: dto.workTools ? (dto.workTools as any) : undefined,
        isSameAsOfficeLocation: dto.isSameAsOfficeLocation,
        workZone: dto.workZone,
        workSchedule: dto.workSchedule,
        skillsGained: dto.skillsGained ? (dto.skillsGained as any) : undefined,
        mentorName: dto.mentorName,
        mentorRole: dto.mentorRole,
        hasAbsorptionOpportunity: dto.hasAbsorptionOpportunity,
        taskDescription: dto.taskDescription,
        contractType: dto.contractType,
        contractDurationMonths: dto.contractType === EmploymentContractType.PKWTT ? null : dto.contractDurationMonths,
        projectDuration: dto.projectDuration,
        requiredSkills: dto.requiredSkills ? (dto.requiredSkills as any) : undefined,
        mandatoryCerts: dto.mandatoryCerts ? (dto.mandatoryCerts as any) : undefined,
        preferredMajors: dto.preferredMajors ? (dto.preferredMajors as any) : undefined,
        minEducation: dto.minEducation,
        minExperienceYears: dto.opportunityType === OpportunityType.INTERNSHIP ? 0 : dto.minExperienceYears,
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
    await this.checkAndExpireVacancies();

    const list = await this.prisma.jobVacancy.findMany({
      where: { status: VacancyStatus.OPEN },
      include: {
        employer: {
          select: {
            companyName: true,
            logoUrl: true,
            industrySector: true,
            address: true,
            picName: true,
            picPhone: true,
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

  // ============================================================
  // USE CASE 7: EVALUASI MASA AKTIF LOWONGAN (Auto-Expire TTL)
  // ============================================================
  async checkAndExpireVacancies() {
    const now = new Date();
    const expiredResult = await this.prisma.jobVacancy.updateMany({
      where: {
        status: VacancyStatus.OPEN,
        expiresAt: {
          lte: now,
        },
      },
      data: {
        status: VacancyStatus.EXPIRED,
      },
    });

    if (expiredResult.count > 0) {
      this.logger.log(`[Lifecycle Engine] ${expiredResult.count} lowongan telah otomatis beralih ke status EXPIRED.`);
    }

    return expiredResult.count;
  }

  // ============================================================
  // USE CASE 8: ANTREAN HASIL LOWONGAN KEDALUWARSA (Outcome Gatekeeper)
  // ============================================================
  async getPendingOutcomes(employerId: string) {
    await this.checkAndExpireVacancies();

    const pendingList = await this.prisma.jobVacancy.findMany({
      where: {
        employerId,
        status: VacancyStatus.EXPIRED,
        closureReason: null,
      },
      include: {
        approaches: {
          include: {
            talent: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
                nik: true,
              },
            },
          },
        },
      },
      orderBy: { expiresAt: 'desc' },
    });

    return {
      status: 'success',
      total: pendingList.length,
      data: pendingList,
    };
  }

  // ============================================================
  // USE CASE 9: RESOLUSI HASIL 1-KLIK (Outcome Resolution)
  // ============================================================
  async resolveOutcome(vacancyId: string, employerId: string, dto: ResolveVacancyOutcomeDto) {
    const vacancy = await this.prisma.jobVacancy.findUnique({
      where: { id: vacancyId },
      include: { employer: true, approaches: true },
    });

    if (!vacancy) {
      throw new NotFoundException('Lowongan pekerjaan tidak ditemukan.');
    }

    if (vacancy.employerId !== employerId) {
      throw new ForbiddenException('Anda tidak berwenang menyelesaikan outcome lowongan milik perusahaan lain.');
    }

    // 1. EXTEND_TTL: Perpanjang masa aktif lowongan (kembalikan ke OPEN)
    if (dto.outcome === 'EXTEND_TTL') {
      const activeDays = vacancy.activeDaysDuration || 14;
      const newExpiresAt = new Date(Date.now() + activeDays * 24 * 60 * 60 * 1000);
      const updated = await this.prisma.jobVacancy.update({
        where: { id: vacancyId },
        data: {
          status: VacancyStatus.OPEN,
          expiresAt: newExpiresAt,
          closureReason: null,
        },
      });

      this.logger.log(`[Lifecycle Engine] Vacancy ${vacancy.title} TTL extended by ${activeDays} days.`);

      return {
        status: 'success',
        message: `Masa aktif lowongan "${vacancy.title}" berhasil diperpanjang ${activeDays} hari ke depan.`,
        data: updated,
      };
    }

    // 2. HIRED_CANDIDATE: Perekrutan talenta yang sudah di-approach melalui platform
    if (dto.outcome === 'HIRED_CANDIDATE') {
      const selectedTalentIds = dto.selectedTalentIds || [];
      if (selectedTalentIds.length === 0) {
        throw new BadRequestException('Pilih setidaknya satu talenta yang berhasil direkrut.');
      }

      for (const talentId of selectedTalentIds) {
        await this.prisma.talentApproach.upsert({
          where: {
            vacancyId_talentId: { vacancyId, talentId },
          },
          update: { status: 'HIRED' },
          create: {
            vacancyId,
            talentId,
            aiMatchScore: 90,
            status: 'HIRED',
            talentNotifiedAt: new Date(),
          },
        });
      }

      const updated = await this.prisma.jobVacancy.update({
        where: { id: vacancyId },
        data: {
          status: VacancyStatus.CLOSED,
          closureReason: dto.notes ? `HIRED_INTERNAL: ${dto.notes}` : 'HIRED_INTERNAL',
        },
      });

      this.logger.log(`[Lifecycle Engine] Vacancy ${vacancy.title} resolved as HIRED_INTERNAL (${selectedTalentIds.length} talents).`);

      return {
        status: 'success',
        message: `Outcome rekrutmen berhasil dicatat. ${selectedTalentIds.length} talenta resmi direkrut dan lowongan ditutup.`,
        data: updated,
      };
    }

    // 3. EXTERNAL_HIRED: Terisi melalui saluran luar platform
    if (dto.outcome === 'EXTERNAL_HIRED') {
      const updated = await this.prisma.jobVacancy.update({
        where: { id: vacancyId },
        data: {
          status: VacancyStatus.CLOSED,
          closureReason: dto.notes ? `HIRED_EXTERNAL: ${dto.notes}` : 'HIRED_EXTERNAL',
        },
      });

      this.logger.log(`[Lifecycle Engine] Vacancy ${vacancy.title} resolved as HIRED_EXTERNAL.`);

      return {
        status: 'success',
        message: `Outcome rekrutmen dicatat sebagai pemenuhan dari jalur luar platform. Lowongan resmi ditutup.`,
        data: updated,
      };
    }

    // 4. CANCELLED: Pembatalan pembukaan posisi proyek
    if (dto.outcome === 'CANCELLED') {
      const updated = await this.prisma.jobVacancy.update({
        where: { id: vacancyId },
        data: {
          status: VacancyStatus.CLOSED,
          closureReason: dto.notes ? `CANCELLED: ${dto.notes}` : 'CANCELLED',
        },
      });

      this.logger.log(`[Lifecycle Engine] Vacancy ${vacancy.title} resolved as CANCELLED.`);

      return {
        status: 'success',
        message: `Lowongan resmi dibatalkan dan diarsipkan.`,
        data: updated,
      };
    }

    throw new BadRequestException('Outcome tidak valid.');
  }
}
