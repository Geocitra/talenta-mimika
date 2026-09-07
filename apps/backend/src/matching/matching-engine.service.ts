import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MatchingEngineService {
  constructor(private readonly prisma: PrismaService) {}

  // Skala peringkat pendidikan untuk kalkulasi fuzzy
  private readonly EDUCATION_RANK: Record<string, number> = {
    SD: 1,
    SMP: 2,
    SMA: 3,
    SMK: 3,
    D3: 4,
    S1: 5,
    S2: 6,
  };

  async getRankedCandidatesForVacancy(vacancyId: string, employerId: string) {
    // 1. Ambil data Lowongan Pekerjaan
    const vacancy = await this.prisma.jobVacancy.findUnique({
      where: { id: vacancyId },
      include: { employer: true },
    });

    if (!vacancy) {
      throw new NotFoundException('Lowongan pekerjaan tidak ditemukan.');
    }

    if (vacancy.employerId !== employerId) {
      throw new ForbiddenException('Anda tidak memiliki akses untuk melihat kandidat lowongan ini.');
    }

    // 2. Ambil seluruh talenta yang siap kerja (isAvailable = true)
    const candidates = await this.prisma.talent.findMany({
      where: { isAvailable: true },
      include: {
        approaches: {
          where: { vacancyId },
        },
      },
    });

    // 3. Eksekusi Mesin Kalkulasi Multi-Faktor untuk setiap kandidat
    const evaluatedCandidates = candidates.map((talent) => {
      const evaluation = this.evaluateCandidate(vacancy, talent);
      return {
        talentId: talent.id,
        fullName: talent.fullName,
        nik: talent.nik,
        avatarUrl: talent.avatarUrl,
        certifications: talent.certifications,
        phone: talent.phone || undefined,
        overallScore: evaluation.overallScore,
        breakdown: evaluation.breakdown,
        aiReasoning: evaluation.aiReasoning,
        topSkills: (Array.isArray(talent.skills) ? talent.skills : []).map(
          (s: any) => (typeof s === 'string' ? s : s.name || ''),
        ),
        totalExperienceMonths: evaluation.totalExperienceMonths,
        lastEducationDegree: evaluation.lastEducationDegree,
        isApproached: talent.approaches.length > 0,
      };
    });

    // 4. Urutkan kandidat dari skor kecocokan tertinggi (Descending)
    evaluatedCandidates.sort((a, b) => b.overallScore - a.overallScore);

    return {
      status: 'success',
      vacancyId: vacancy.id,
      vacancyTitle: vacancy.title,
      totalEvaluated: evaluatedCandidates.length,
      candidates: evaluatedCandidates,
    };
  }

  async approachTalent(vacancyId: string, talentId: string, employerId: string) {
    // 1. Validasi Lowongan & Kepemilikan Perusahaan
    const vacancy = await this.prisma.jobVacancy.findUnique({
      where: { id: vacancyId },
      include: { employer: true },
    });

    if (!vacancy) {
      throw new NotFoundException('Lowongan pekerjaan tidak ditemukan.');
    }

    if (vacancy.employerId !== employerId) {
      throw new ForbiddenException('Anda tidak memiliki otoritas untuk lowongan ini.');
    }

    // 2. Validasi Talenta
    const talent = await this.prisma.talent.findUnique({
      where: { id: talentId },
      include: { user: true },
    });

    if (!talent) {
      throw new NotFoundException('Data talenta tidak ditemukan.');
    }

    // 3. Cek apakah sudah pernah di-approach
    const existingApproach = await this.prisma.talentApproach.findUnique({
      where: {
        vacancyId_talentId: { vacancyId, talentId },
      },
    });

    if (existingApproach) {
      return {
        status: 'success',
        message: 'Kandidat ini sudah pernah Anda hubungi sebelumnya.',
        data: {
          approachId: existingApproach.id,
          aiMatchScore: Number(existingApproach.aiMatchScore),
          talentContact: {
            fullName: talent.fullName,
            phone: talent.phone,
            email: talent.user.email,
          },
        },
      };
    }

    // 4. Hitung skor AI saat ini
    const evaluation = this.evaluateCandidate(vacancy, talent);

    // 5. Simpan ke tabel talent_approaches
    const newApproach = await this.prisma.talentApproach.create({
      data: {
        vacancyId,
        talentId,
        aiMatchScore: evaluation.overallScore,
        aiReasoning: evaluation.aiReasoning,
        status: 'APPROACHED',
        talentNotifiedAt: new Date(),
      },
    });

    // 6. Kirim Notifikasi Resmi ke Talenta (Simulasi Console / Email)
    console.log(
      `\n[DISPATCHER NOTIFIKASI] ==========================================`,
    );
    console.log(`Kepada Talenta  : ${talent.fullName} (${talent.user.email})`);
    console.log(`Perusahaan      : ${vacancy.employer.companyName}`);
    console.log(`Kebutuhan Posisi: ${vacancy.title}`);
    console.log(
      `Pesan           : Profil Anda telah dipadankan oleh AI dan diminati oleh perusahaan! Pihak HRD akan segera menghubungi nomor ${talent.phone || 'telepon Anda'} untuk tindak lanjut di luar aplikasi.`,
    );
    console.log(
      `===================================================================\n`,
    );

    return {
      status: 'success',
      message: `Berhasil mendekati kandidat ${talent.fullName}. Notifikasi resmi telah dikirim ke talenta.`,
      data: {
        approachId: newApproach.id,
        aiMatchScore: evaluation.overallScore,
        talentContact: {
          fullName: talent.fullName,
          phone: talent.phone,
          email: talent.user.email,
        },
      },
    };
  }

  // ============================================================
  // LOGIKA MATEMATIS 4 VEKTOR PENCAPAIAN SKOR
  // ============================================================
  private evaluateCandidate(vacancy: any, talent: any) {
    // A. VEKTOR 1: KEAHLIAN TEKNIS (Bobot: 40%)
    const requiredSkills: string[] = Array.isArray(vacancy.requiredSkills)
      ? (vacancy.requiredSkills as string[]).map((s) => s.toLowerCase().trim())
      : [];

    const talentSkills: string[] = (Array.isArray(talent.skills) ? talent.skills : [])
      .map((s: any) => (typeof s === 'string' ? s : s.name || '').toLowerCase().trim());

    let matchedSkillCount = 0;
    requiredSkills.forEach((req) => {
      if (talentSkills.some((ts) => ts.includes(req) || req.includes(ts))) {
        matchedSkillCount++;
      }
    });

    const skillMatchScore =
      requiredSkills.length > 0
        ? Math.min(100, Math.round((matchedSkillCount / requiredSkills.length) * 100))
        : 100;

    // B. VEKTOR 2: PENDIDIKAN & PENGALAMAN + FUZZY LOGIC (Bobot: 30%)
    const talentEduList = Array.isArray(talent.education) ? talent.education : [];
    let highestEduDegree = 'SMA';
    let highestEduRank = 3;

    talentEduList.forEach((edu: any) => {
      const degree = (edu.degree || 'SMA').toUpperCase();
      const rank = this.EDUCATION_RANK[degree] || 3;
      if (rank > highestEduRank) {
        highestEduRank = rank;
        highestEduDegree = degree;
      }
    });

    const targetEduRank = this.EDUCATION_RANK[(vacancy.minEducation || '').toUpperCase()] || 3;

    // Hitung total akumulasi pengalaman kerja dalam bulan
    const workList = Array.isArray(talent.workExperience) ? talent.workExperience : [];
    const totalExperienceMonths = workList.reduce(
      (sum: number, w: any) => sum + (Number(w.durationMonths) || 0),
      0,
    );
    const totalExpYears = totalExperienceMonths / 12;

    let experienceMatchScore = 0;
    let isFuzzyEquivalenceApplied = false;

    // Penilaian Kualifikasi Pendidikan vs Pengalaman
    if (highestEduRank >= targetEduRank) {
      // Pendidikan memenuhi syarat formal
      const expRatio =
        vacancy.minExperienceYears > 0
          ? Math.min(1.0, totalExpYears / vacancy.minExperienceYears)
          : 1.0;
      experienceMatchScore = Math.round(expRatio * 100);
    } else {
      // Pendidikan di bawah syarat minimal -> Cek sakelar Penyetaraan Fuzzy
      if (vacancy.allowEquivalence && totalExpYears >= vacancy.minExperienceYears + 3) {
        // Logika Fuzzy Aktif: Lolos kompensasi karena pengalaman matang di lapangan!
        isFuzzyEquivalenceApplied = true;
        experienceMatchScore = 85; // Diberikan nilai kompensasi tinggi
      } else {
        // Gagal kompensasi
        experienceMatchScore = 30;
      }
    }

    // C. VEKTOR 3: SOCIAL DNA & POLA KERJA (Bobot: 20%)
    let socialDnaMatchScore = 70; // Nilai dasar stabilitas
    const socialDna = (typeof talent.socialDna === 'object' && talent.socialDna !== null)
      ? (talent.socialDna as any)
      : {};
    const preferences: string[] = Array.isArray(socialDna.workPreferences)
      ? socialDna.workPreferences.map((p: string) => String(p).toLowerCase())
      : [];

    const descLower = `${vacancy.taskDescription || ''} ${vacancy.projectDuration || ''}`.toLowerCase();

    // Evaluasi preferensi lingkungan & shift kerja tambang Mimika
    if (descLower.includes('shift') && preferences.some((p) => p.includes('shift'))) {
      socialDnaMatchScore += 15;
    }
    if (descLower.includes('remote') && preferences.some((p) => p.includes('remote'))) {
      socialDnaMatchScore += 15;
    }
    if (socialDna.communityActivities) {
      socialDnaMatchScore += 10;
    }
    socialDnaMatchScore = Math.min(100, socialDnaMatchScore);

    // D. VEKTOR 4: JARAK GEOSPASIAL GIS (Bobot: 10%)
    let distanceMatchScore = 75; // Nilai netral jika koordinat kosong
    let distanceKm: number | undefined = undefined;

    if (
      vacancy.jobLocationLat &&
      vacancy.jobLocationLng &&
      talent.locationLat &&
      talent.locationLng
    ) {
      distanceKm = this.calculateHaversineDistance(
        vacancy.jobLocationLat,
        vacancy.jobLocationLng,
        talent.locationLat,
        talent.locationLng,
      );
      if (distanceKm <= 15) distanceMatchScore = 100;
      else if (distanceKm <= 35) distanceMatchScore = 80;
      else distanceMatchScore = 50;
    }

    // TOTAL KALKULASI SKOR AKHIR
    const overallScore = Math.round(
      skillMatchScore * 0.40 +
      experienceMatchScore * 0.30 +
      socialDnaMatchScore * 0.20 +
      distanceMatchScore * 0.10,
    );

    // AI REASONING (Penjelasan Mengapa Kandidat Ini Direkomendasikan)
    let aiReasoning = `Kandidat memiliki skor kecocokan ${overallScore}%. Memenuhi ${matchedSkillCount} dari ${requiredSkills.length} keahlian wajib.`;
    if (isFuzzyEquivalenceApplied) {
      aiReasoning += ` Diberikan kompensasi pengalaman tinggi (Fuzzy Equivalence): Lulusan ${highestEduDegree} dengan akumulasi ${totalExpYears.toFixed(1)} tahun pengalaman di lapangan.`;
    }
    if (socialDnaMatchScore >= 85) {
      aiReasoning += ` Memiliki Social DNA dan preferensi pola kerja yang sangat selaras dengan kebutuhan proyek.`;
    }

    return {
      overallScore,
      breakdown: {
        skillMatchScore,
        experienceMatchScore,
        socialDnaMatchScore,
        distanceMatchScore,
        distanceKm,
        isFuzzyEquivalenceApplied,
      },
      aiReasoning,
      totalExperienceMonths,
      lastEducationDegree: highestEduDegree,
    };
  }

  // Formula Haversine Jarak Radius Bumi
  private calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Radius bumi dalam Km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }
}
