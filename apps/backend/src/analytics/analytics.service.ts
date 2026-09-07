import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  VerificationStatus,
  VacancyStatus,
  TrainingEnrollmentStatus,
} from '@prisma/client';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getCommandCenterData() {
    // 1. HITUNG 8 KPI STRATEGIS DAERAH
    const [
      totalTalents,
      activeSeekingTalents,
      totalEmployers,
      openVacancies,
      totalApproaches,
      totalTrainingParticipants,
      totalCertifiedGraduates,
    ] = await Promise.all([
      this.prisma.talent.count(),
      this.prisma.talent.count({ where: { isAvailable: true } }),
      this.prisma.employer.count({
        where: { verificationStatus: VerificationStatus.APPROVED },
      }),
      this.prisma.jobVacancy.count({
        where: { status: VacancyStatus.OPEN },
      }),
      this.prisma.talentApproach.count(),
      this.prisma.trainingEnrollment.count(),
      this.prisma.trainingEnrollment.count({
        where: { status: TrainingEnrollmentStatus.COMPLETED },
      }),
    ]);

    // Hitung jumlah talenta unik yang pernah di-approach oleh industri
    const approachedTalentsGroup = await this.prisma.talentApproach.groupBy({
      by: ['talentId'],
    });
    const uniqueApproachedCount = approachedTalentsGroup.length;

    const localAbsorptionRate =
      totalTalents > 0
        ? Math.min(100, Math.round((uniqueApproachedCount / totalTalents) * 1000) / 10)
        : 0;

    // 2. CORONG KONVERSI KETENAGAKERJAAN (WORKFORCE FUNNEL 4 TAHAP)
    const funnel = [
      { stage: 'Angkatan Kerja Terdata', count: totalTalents },
      { stage: 'Peserta Pelatihan Daerah', count: totalTrainingParticipants },
      { stage: 'Lulusan Tersertifikasi', count: totalCertifiedGraduates },
      { stage: 'Diserap / Didekati Industri', count: uniqueApproachedCount },
    ];

    // 3. ANALISIS SKILL GAP (DEMAND INDUSTRI VS SUPPLY WARGA MIMIKA)
    const skillGaps = await this.calculateSkillGaps();

    // 4. DISTRIBUSI SEKTOR INDUSTRI
    const industryDistribution = await this.calculateIndustryDistribution(totalEmployers);

    // 5. DETAK SISTEM AKTIVITAS TERKINI (REAL-TIME AUDIT PULSE)
    const recentActivities = await this.getRecentActivities();

    return {
      status: 'success',
      data: {
        kpis: {
          totalTalents,
          activeSeekingTalents,
          totalEmployers,
          openVacancies,
          totalApproaches,
          totalTrainingParticipants,
          totalCertifiedGraduates,
          localAbsorptionRate,
        },
        funnel,
        skillGaps,
        industryDistribution,
        recentActivities,
      },
    };
  }

  // ============================================================
  // PRIVATE HELPER 1: KALKULASI KESENJANGAN KETERAMPILAN (SKILL GAP)
  // ============================================================
  private async calculateSkillGaps() {
    // Sisi Demand: Lowongan yang sedang OPEN
    const openVacancies = await this.prisma.jobVacancy.findMany({
      where: { status: VacancyStatus.OPEN },
      select: { requiredSkills: true },
    });

    const demandMap: Record<string, number> = {};
    openVacancies.forEach((vac) => {
      const skills = Array.isArray(vac.requiredSkills) ? vac.requiredSkills : [];
      skills.forEach((sk: any) => {
        const name = (typeof sk === 'string' ? sk : sk.name || '').trim();
        if (name) {
          demandMap[name] = (demandMap[name] || 0) + 1;
        }
      });
    });

    // Sisi Supply: Keahlian yang dimiliki seluruh Talenta
    const allTalents = await this.prisma.talent.findMany({
      select: { skills: true },
    });

    const supplyMap: Record<string, number> = {};
    allTalents.forEach((tal) => {
      const skills = Array.isArray(tal.skills) ? tal.skills : [];
      skills.forEach((sk: any) => {
        const name = (typeof sk === 'string' ? sk : sk.name || '').trim();
        if (name) {
          supplyMap[name] = (supplyMap[name] || 0) + 1;
        }
      });
    });

    // Gabungkan seluruh kunci keahlian
    const allSkillKeys = Array.from(
      new Set([...Object.keys(demandMap), ...Object.keys(supplyMap)]),
    );

    const result = allSkillKeys.map((skillName) => {
      const demandCount = demandMap[skillName] || 0;
      const supplyCount = supplyMap[skillName] || 0;
      const gap = demandCount - supplyCount;

      let status: 'SURPLUS' | 'BALANCE' | 'CRITICAL_GAP' = 'BALANCE';
      if (gap > 0) status = 'CRITICAL_GAP';
      else if (gap < 0) status = 'SURPLUS';

      return {
        skillName,
        demandCount,
        supplyCount,
        gap,
        status,
      };
    });

    // Urutkan dari keahlian yang paling banyak dicari industri
    return result.sort((a, b) => b.demandCount - a.demandCount).slice(0, 8);
  }

  // ============================================================
  // PRIVATE HELPER 2: DISTRIBUSI SEKTOR INDUSTRI
  // ============================================================
  private async calculateIndustryDistribution(totalApprovedEmployers: number) {
    const employers = await this.prisma.employer.findMany({
      where: { verificationStatus: VerificationStatus.APPROVED },
      select: { industrySector: true },
    });

    const sectorCounts: Record<string, number> = {};
    employers.forEach((emp) => {
      const sector = emp.industrySector?.trim() || 'Lainnya';
      sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
    });

    return Object.entries(sectorCounts).map(([sector, count]) => ({
      sector,
      companyCount: count,
      percentage:
        totalApprovedEmployers > 0
          ? Math.round((count / totalApprovedEmployers) * 100)
          : 0,
    }));
  }

  // ============================================================
  // PRIVATE HELPER 3: DETAK SISTEM AKTIVITAS TERKINI (REAL-TIME FEED)
  // ============================================================
  private async getRecentActivities() {
    const [latestApproaches, latestVacancies, latestGraduations] =
      await Promise.all([
        this.prisma.talentApproach.findMany({
          take: 3,
          orderBy: { createdAt: 'desc' },
          include: {
            talent: { select: { fullName: true } },
            vacancy: {
              select: {
                title: true,
                employer: { select: { companyName: true } },
              },
            },
          },
        }),
        this.prisma.jobVacancy.findMany({
          take: 3,
          orderBy: { createdAt: 'desc' },
          include: {
            employer: { select: { companyName: true } },
          },
        }),
        this.prisma.trainingEnrollment.findMany({
          where: { status: TrainingEnrollmentStatus.COMPLETED },
          take: 3,
          orderBy: { completedAt: 'desc' },
          include: {
            talent: { select: { fullName: true } },
            program: { select: { title: true } },
          },
        }),
      ]);

    const feed: any[] = [];

    latestApproaches.forEach((app) => {
      feed.push({
        id: `app-${app.id}`,
        type: 'APPROACH',
        title: 'Pendekatan Kandidat oleh Industri',
        description: `${app.vacancy.employer.companyName} melakukan approach ke ${app.talent.fullName} untuk posisi "${app.vacancy.title}".`,
        timestamp: app.createdAt.toISOString(),
      });
    });

    latestVacancies.forEach((vac) => {
      feed.push({
        id: `vac-${vac.id}`,
        type: 'VACANCY',
        title: 'Lowongan Kebutuhan Baru Dibuka',
        description: `${vac.employer.companyName} menerbitkan lowongan "${vac.title}".`,
        timestamp: vac.createdAt.toISOString(),
      });
    });

    latestGraduations.forEach((grad) => {
      feed.push({
        id: `grad-${grad.id}`,
        type: 'GRADUATION',
        title: 'Kelulusan Sertifikasi Pelatihan Daerah',
        description: `${grad.talent.fullName} resmi lulus dari "${grad.program.title}" (No: ${grad.certificateNumber || '-'}).`,
        timestamp: (grad.completedAt || grad.createdAt).toISOString(),
      });
    });

    // Urutkan seluruh aktivitas berdasarkan waktu terbaru
    feed.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    return feed.slice(0, 6);
  }
}
