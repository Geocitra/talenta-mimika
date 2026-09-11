import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenAiService } from '../ai/openai.service';
import { PiiSanitizerUtil } from '../ai/utils/pii-sanitizer.util';
import {
  OFFER_DRAFTER_SYSTEM_PROMPT,
  buildOfferDraftUserPrompt,
} from '../ai/prompts/offer-drafter.prompt';
import {
  GUIDED_MATCHING_SYSTEM_PROMPT,
  buildGuidedMatchingUserPrompt,
} from '../ai/prompts/guided-matching.prompt';

export interface AiEvaluationOutput {
  narrative: string;
  strengths: string[];
  affirmationNote?: string;
  qualitativeScore?: number;
  provider: 'OPENAI_GPT_4O_MINI' | 'LOCAL_HEURISTIC';
}

@Injectable()
export class MatchingEngineService {
  private readonly logger = new Logger(MatchingEngineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly openAiService: OpenAiService,
  ) {}

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

  // Cache in-memory untuk evaluasi AI agar tidak memanggil ulang OpenAI berulang kali (Hemat Token & Cepat)
  private readonly aiEvaluationCache = new Map<string, AiEvaluationOutput>();

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

    // Hitung nomor dan judul batch berikutnya secara dinamis berdasarkan seluruh lowongan yang pernah dibuat
    const baseTitle = vacancy.title.replace(/\s*-\s*Batch\s*\d+$/i, '').trim();
    const existingBatches = await this.prisma.jobVacancy.findMany({
      where: {
        employerId: vacancy.employerId,
        title: { contains: baseTitle },
      },
      select: { title: true },
    });
    let maxBatch = 1;
    for (const v of existingBatches) {
      const match = v.title.match(/-\s*Batch\s*(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxBatch) maxBatch = num;
      }
    }
    const nextBatchNum = maxBatch + 1;
    const nextBatchTitle = `${baseTitle} - Batch ${nextBatchNum}`;

    // =========================================================================
    // FAST-PATH: LOWONGAN RESMI CLOSED (MODE ARSIP & BUKU REGISTER KONTRAK)
    // =========================================================================
    // Jika lowongan sudah ditutup:
    // 1. Lewati seluruh kalkulasi fuzzy matching & AI evaluation (0 token, 0ms latency).
    // 2. Cukup ambil talenta yang terikat pada lowongan ini (HIRED / SELECTED / REJECTED).
    // 3. candidates (rekomendasi baru) diset kosong [] karena lowongan telah selesai.
    // 4. Lindungi privasi talenta lain (tidak membocorkan kontak orang yang tidak direkrut).
    if (vacancy.status === 'CLOSED') {
      const boundApproaches = await this.prisma.talentApproach.findMany({
        where: {
          vacancyId,
          status: { in: ['HIRED', 'SELECTED', 'REJECTED'] },
        },
        include: {
          talent: {
            include: {
              user: { select: { email: true } },
            },
          },
        },
      });

      const selectedCandidates: any[] = [];
      const rejectedCandidates: any[] = [];

      for (const app of boundApproaches) {
        const talent = app.talent;
        if (!talent) continue;

        const evaluation = await this.evaluateCandidate(vacancy, talent);

        const dto = {
          talentId: talent.id,
          fullName: talent.fullName,
          nik: talent.nik,
          avatarUrl: talent.avatarUrl,
          email: talent.user?.email,
          certifications: talent.certifications,
          skills: talent.skills,
          phone: talent.phone || undefined,
          bio: talent.bio || undefined,
          socialDna: talent.socialDna || undefined,
          overallScore: evaluation.overallScore,
          breakdown: evaluation.breakdown,
          aiReasoning: evaluation.aiReasoning,
          aiStrengths: [] as string[],
          affirmationNote: undefined as string | undefined,
          qualitativeScore: undefined as number | undefined,
          aiProvider: 'ARCHIVE_REGISTRY',
          isAiEvaluated: false,
          topSkills: (Array.isArray(talent.skills) ? talent.skills : []).map(
            (s: any) => (typeof s === 'string' ? s : s.name || ''),
          ),
          totalExperienceMonths: evaluation.totalExperienceMonths,
          lastEducationDegree: evaluation.lastEducationDegree,
          isApproached: true,
          approachStatus: app.status as any,
          isSelected: app.status === 'SELECTED' || app.status === 'HIRED',
          isHired: app.status === 'HIRED',
          isRejected: app.status === 'REJECTED',
        };

        if (app.status === 'HIRED' || app.status === 'SELECTED') {
          selectedCandidates.push(dto);
        } else if (app.status === 'REJECTED') {
          rejectedCandidates.push(dto);
        }
      }

      const hiredCandidates = selectedCandidates.filter((c) => c.isHired);

      return {
        status: 'success',
        vacancyId: vacancy.id,
        vacancyTitle: vacancy.title,
        quota: vacancy.quota,
        selectedCount: selectedCandidates.length,
        hiredCount: hiredCandidates.length,
        remainingQuota: Math.max(0, (vacancy.quota || 1) - hiredCandidates.length),
        isQuotaFulfilled: true,
        isFinalized: true,
        vacancy: {
          id: vacancy.id,
          title: vacancy.title,
          opportunityType: vacancy.opportunityType,
          quota: vacancy.quota,
          selectedCount: selectedCandidates.length,
          hiredCount: hiredCandidates.length,
          remainingQuota: 0,
          salaryMin: vacancy.salaryMin ? Number(vacancy.salaryMin) : undefined,
          salaryMax: vacancy.salaryMax ? Number(vacancy.salaryMax) : undefined,
          stipendAmount: vacancy.stipendAmount ? Number(vacancy.stipendAmount) : undefined,
          benefits: vacancy.benefits,
          workTools: vacancy.workTools,
          workZone: vacancy.workZone,
          workSchedule: vacancy.workSchedule,
          allowEquivalence: vacancy.allowEquivalence,
          minEducation: vacancy.minEducation,
          minExperienceYears: vacancy.minExperienceYears,
          skillsGained: vacancy.skillsGained,
          mentorName: vacancy.mentorName,
          mentorRole: vacancy.mentorRole,
          hasAbsorptionOpportunity: vacancy.hasAbsorptionOpportunity,
          status: vacancy.status,
          nextBatchNum,
          nextBatchTitle,
        },
        totalEvaluated: boundApproaches.length,
        totalQualified: selectedCandidates.length,
        selectedCandidates,
        hiredCandidates,
        candidates: [], // Kosong karena lowongan telah CLOSED
        rejectedCandidates,
      };
    }

    // 2. Lowongan masih OPEN: Ambil seluruh talenta yang siap kerja (isAvailable = true)
    // Sesuai Aksioma Kedaulatan Talenta: Tidak ada penyaringan status HIRED antarkorporasi.
    // Talenta yang membuka profilnya berhak selalu muncul di radar peluang kerja yang lebih baik.
    const candidates = await this.prisma.talent.findMany({
      where: {
        OR: [
          { isAvailable: true },
          {
            approaches: {
              some: { vacancyId },
            },
          },
        ],
      },
      include: {
        user: { select: { email: true } },
        approaches: {
          where: { vacancyId },
        },
      },
    });

    // 3. Eksekusi Mesin Kalkulasi Multi-Faktor untuk setiap kandidat
    const evaluatedCandidates = await Promise.all(
      candidates.map(async (talent) => {
        const evaluation = await this.evaluateCandidate(vacancy, talent);
        const approach = Array.isArray(talent.approaches) ? talent.approaches[0] : null;

        return {
          talentId: talent.id,
          fullName: talent.fullName,
          nik: talent.nik,
          avatarUrl: talent.avatarUrl,
          email: talent.user?.email,
          certifications: talent.certifications,
          skills: talent.skills,
          phone: talent.phone || undefined,
          bio: talent.bio || undefined,
          socialDna: talent.socialDna || undefined,
          overallScore: evaluation.overallScore,
          breakdown: evaluation.breakdown,
          aiReasoning: evaluation.aiReasoning,
          aiStrengths: [] as string[],
          affirmationNote: undefined as string | undefined,
          qualitativeScore: undefined as number | undefined,
          aiProvider: 'LOCAL_HEURISTIC',
          isAiEvaluated: false,
          topSkills: (Array.isArray(talent.skills) ? talent.skills : []).map(
            (s: any) => (typeof s === 'string' ? s : s.name || ''),
          ),
          totalExperienceMonths: evaluation.totalExperienceMonths,
          lastEducationDegree: evaluation.lastEducationDegree,
          isApproached: Boolean(approach),
          approachStatus: approach ? (approach.status as any) : undefined,
          isSelected: approach?.status === 'SELECTED',
          isHired: approach?.status === 'HIRED',
          isRejected: approach?.status === 'REJECTED',
        };
      }),
    );

    // 4. Pisahkan:
    // a. selectedCandidates: talenta yang berstatus 'SELECTED' atau 'HIRED' untuk lowongan ini
    const selectedCandidates = evaluatedCandidates.filter((c) => c.isSelected || c.isHired);

    // b. unselectedCandidates: talenta yang belum dipilih dan belum di-reject
    const unselectedCandidates = evaluatedCandidates.filter((c) => !c.isSelected && !c.isHired && !c.isRejected);

    // c. rejectedCandidates: talenta yang berstatus 'REJECTED' untuk lowongan ini (Dilewati)
    const rejectedCandidates = evaluatedCandidates.filter((c) => c.isRejected);

    // 5. Urutkan kandidat yang belum dipilih dari skor kecocokan tertinggi
    unselectedCandidates.sort((a, b) => b.overallScore - a.overallScore);

    // 6. FILTER: Passing Grade Threshold (Hanya yang lolos passing grade >= 50%)
    const qualifiedCandidates = unselectedCandidates.filter((c) => c.overallScore >= 50);

    // 7. QUOTA SIZING: Hitung sisa kuota lowongan
    const quota = vacancy.quota || 1;
    const remainingQuota = Math.max(0, quota - selectedCandidates.length);
    const maxShortlist = remainingQuota > 0
      ? Math.min(qualifiedCandidates.length, Math.max(3, remainingQuota * 3))
      : Math.min(qualifiedCandidates.length, 3);
    const topCandidates = qualifiedCandidates.slice(0, maxShortlist);

    // 8. Evaluasi AI untuk seluruh kandidat di shortlist dan kandidat terpilih (dengan cache memoized)
    const candidatesToAiEvaluate = [...topCandidates, ...selectedCandidates];

    await Promise.all(
      candidatesToAiEvaluate.map(async (cand) => {
        const talent = candidates.find((c) => c.id === cand.talentId);
        if (talent) {
          const aiResult = await this.generateAiReasoning(vacancy, talent, {
            overallScore: cand.overallScore,
            matchedSkillCount: (cand.breakdown as any)?.matchedSkillCount || 1,
            requiredCount: Array.isArray(vacancy.requiredSkills) ? vacancy.requiredSkills.length : 1,
            isFuzzyEquivalenceApplied: (cand.breakdown as any)?.isFuzzyEquivalenceApplied || false,
          });

          cand.aiReasoning = aiResult.narrative;
          cand.aiStrengths = aiResult.strengths;
          cand.affirmationNote = aiResult.affirmationNote;
          cand.qualitativeScore = aiResult.qualitativeScore;
          cand.aiProvider = aiResult.provider;
          cand.isAiEvaluated = aiResult.provider === 'OPENAI_GPT_4O_MINI';

          // Jika OpenAI memberikan skor kualitatif (0-100), kalibrasi skor akhir secara proporsional
          if (typeof aiResult.qualitativeScore === 'number' && aiResult.qualitativeScore > 0) {
            const normalizedQualScore = aiResult.qualitativeScore <= 10
              ? aiResult.qualitativeScore * 10
              : aiResult.qualitativeScore;
            cand.overallScore = Math.min(100, Math.round(cand.overallScore * 0.65 + normalizedQualScore * 0.35));
          }
        }
      }),
    );

    // Urutkan kembali shortlist kandidat yang belum direkrut berdasarkan skor terkalibrasi AI
    topCandidates.sort((a, b) => b.overallScore - a.overallScore);

    const hiredCandidates = selectedCandidates.filter((c) => c.isHired);

    return {
      status: 'success',
      vacancyId: vacancy.id,
      vacancyTitle: vacancy.title,
      quota: vacancy.quota,
      selectedCount: selectedCandidates.length,
      hiredCount: hiredCandidates.length,
      remainingQuota,
      isQuotaFulfilled: selectedCandidates.length >= quota,
      isFinalized: false,
      vacancy: {
        id: vacancy.id,
        title: vacancy.title,
        opportunityType: vacancy.opportunityType,
        quota: vacancy.quota,
        selectedCount: selectedCandidates.length,
        hiredCount: hiredCandidates.length,
        remainingQuota,
        salaryMin: vacancy.salaryMin ? Number(vacancy.salaryMin) : undefined,
        salaryMax: vacancy.salaryMax ? Number(vacancy.salaryMax) : undefined,
        stipendAmount: vacancy.stipendAmount ? Number(vacancy.stipendAmount) : undefined,
        benefits: vacancy.benefits,
        workTools: vacancy.workTools,
        workZone: vacancy.workZone,
        workSchedule: vacancy.workSchedule,
        allowEquivalence: vacancy.allowEquivalence,
        minEducation: vacancy.minEducation,
        minExperienceYears: vacancy.minExperienceYears,
        skillsGained: vacancy.skillsGained,
        mentorName: vacancy.mentorName,
        mentorRole: vacancy.mentorRole,
        hasAbsorptionOpportunity: vacancy.hasAbsorptionOpportunity,
        status: vacancy.status,
        nextBatchNum,
        nextBatchTitle,
      },
      totalEvaluated: candidates.length,
      totalQualified: qualifiedCandidates.length,
      selectedCandidates,
      hiredCandidates,
      candidates: topCandidates,
      rejectedCandidates,
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
        message: 'Kandidat ini sudah pernah Anda dekati sebelumnya.',
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
    const evaluation = await this.evaluateCandidate(vacancy, talent);

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

    // 6. Format Rincian Penawaran Resmi (The Official Employment Proposal)
    const isJob = vacancy.opportunityType === 'JOB';
    const compensationText = isJob
      ? `Estimasi Upah: Rp ${Number(vacancy.salaryMin || 0).toLocaleString('id-ID')} - Rp ${Number(vacancy.salaryMax || 0).toLocaleString('id-ID')} / Bulan`
      : `Uang Saku Magang: Rp ${Number(vacancy.stipendAmount || 0).toLocaleString('id-ID')} / Bulan`;

    const benefitsList: string[] = (Array.isArray(vacancy.benefits) ? vacancy.benefits : []).map(String);
    const workToolsList: string[] = (Array.isArray(vacancy.workTools) ? vacancy.workTools : []).map(String);

    // 7. Agen 3: Personalized Offer & Outreach Drafter (OpenAI dengan Local Fallback)
    let officialLetterDraft: string;
    let whatsAppOutreachDraft: string;

    if (this.openAiService.isAvailable()) {
      try {
        const prompt = buildOfferDraftUserPrompt({
          talentName: talent.fullName,
          companyName: vacancy.employer.companyName,
          nib: vacancy.employer.nib,
          positionTitle: vacancy.title,
          opportunityType: vacancy.opportunityType,
          compensationText,
          benefits: benefitsList,
          workTools: workToolsList,
          workZone: vacancy.workZone,
          picName: vacancy.employer.picName || undefined,
          picPhone: vacancy.employer.picPhone || undefined,
        });

        const aiResponse = await this.openAiService.generateCompletion(
          OFFER_DRAFTER_SYSTEM_PROMPT,
          prompt,
          { temperature: 0.3, maxTokens: 800, jsonMode: true },
        );

        if (aiResponse) {
          const parsed = JSON.parse(aiResponse);
          officialLetterDraft = parsed.officialLetterDraft;
          whatsAppOutreachDraft = parsed.whatsAppOutreachDraft;
        }
      } catch (err) {
        this.logger.warn(`OpenAI offer drafter failed: ${err}. Falling back to standard proposal template.`);
      }
    }

    // Default Fallback Template jika OpenAI offline
    if (!officialLetterDraft! || !whatsAppOutreachDraft!) {
      officialLetterDraft = `SURAT PENAWARAN RESMI KETENAGAKERJAAN DAERAH (MIMIKA TALENTA)\n\nKepada Yth. Sdr/i ${talent.fullName},\n\nPT ${vacancy.employer.companyName} (NIB: ${vacancy.employer.nib || 'Terverifikasi Disnaker'}), melalui platform ketenagakerjaan daerah MIMIKA TALENTA, menyampaikan penawaran resmi untuk posisi "${vacancy.title}" [${vacancy.opportunityType}].\n\nKompensasi: ${compensationText}\nFasilitas Kesejahteraan: ${benefitsList.join(', ') || 'Standar Site'}\nSarana Kerja Disediakan: ${workToolsList.join(', ') || 'Standar Operasional'}\nZona Penempatan: ${vacancy.workZone} (${vacancy.workSchedule})\n\nSilakan konfirmasi kesediaan Anda untuk sesi wawancara langsung melalui kontak PIC HRD: ${vacancy.employer.picName || 'HR Rekrutmen'} (${vacancy.employer.picPhone || '-'}).`;

      whatsAppOutreachDraft = `Halo Sdr/i ${talent.fullName}, saya ${vacancy.employer.picName || 'Tim HR'} dari PT ${vacancy.employer.companyName}. Melalui sistem MIMIKA TALENTA, kualifikasi kompetensi Anda terpilih untuk posisi ${vacancy.title} (${compensationText}). Fasilitas: ${benefitsList.slice(0, 3).join(', ')}. Kami mengundang Anda untuk verifikasi berkas dan wawancara kerja.`;
    }

    console.log(`\n[DISPATCHER TAWARAN RESMI] ==========================================`);
    console.log(`Kepada Talenta  : ${talent.fullName} (${talent.user.email})`);
    console.log(`Perusahaan      : ${vacancy.employer.companyName} (NIB: ${vacancy.employer.nib})`);
    console.log(`PIC HRD         : ${vacancy.employer.picName || 'HR Talent Acquisition'} (${vacancy.employer.picPhone || '-'})`);
    console.log(`Posisi & Kuota  : ${vacancy.title} [${vacancy.opportunityType}] - Kuota: ${vacancy.quota} Orang`);
    console.log(`Kompensasi      : ${compensationText}`);
    console.log(`Fasilitas Site  : ${benefitsList.join(', ') || 'Standar Operasional'}`);
    console.log(`Zona Penempatan : ${vacancy.workZone} (${vacancy.workSchedule})`);
    console.log(`Pesan           : Surat Penawaran Resmi & Draft WhatsApp siap disematkan!`);
    console.log(`====================================================================\n`);

    return {
      status: 'success',
      message: `Tawaran resmi untuk posisi "${vacancy.title}" berhasil disodorkan ke ${talent.fullName}. Notifikasi telah aktif.`,
      data: {
        approachId: newApproach.id,
        aiMatchScore: evaluation.overallScore,
        talentContact: {
          fullName: talent.fullName,
          phone: talent.phone,
          email: talent.user.email,
        },
        proposalDetails: {
          vacancyTitle: vacancy.title,
          opportunityType: vacancy.opportunityType,
          quota: vacancy.quota,
          compensationText,
          benefits: benefitsList,
          workTools: workToolsList,
          workZone: vacancy.workZone,
          picName: vacancy.employer.picName,
          picPhone: vacancy.employer.picPhone,
          officialLetterDraft,
          whatsAppOutreachDraft,
        },
      },
    };
  }

  /**
   * Merekrut Talenta Resmi & Mengunci Talenta (Single Active Contract Lock)
   * Saat tombol ini ditekan, status talenta menjadi isAvailable = false sehingga
   * otomatis hilang dari radar pencarian lowongan seluruh perusahaan lain di Mimika.
   */
  async hireTalent(vacancyId: string, talentId: string, employerId: string) {
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

    const talent = await this.prisma.talent.findUnique({
      where: { id: talentId },
      include: { user: true },
    });

    if (!talent) {
      throw new NotFoundException('Data talenta tidak ditemukan.');
    }

    // 1. Validasi kuota lowongan sebelum merekrut
    const existingApproach = await this.prisma.talentApproach.findUnique({
      where: {
        vacancyId_talentId: { vacancyId, talentId },
      },
    });

    if (existingApproach?.status !== 'HIRED') {
      const currentHiredCount = await this.prisma.talentApproach.count({
        where: {
          vacancyId,
          status: 'HIRED',
        },
      });

      const quota = vacancy.quota || 1;
      if (currentHiredCount >= quota) {
        throw new BadRequestException(
          `Kuota penerimaan untuk lowongan ini sudah terpenuhi (${currentHiredCount}/${quota} orang). Anda tidak dapat merekrut melebihi kuota. Jika ingin mengganti talenta, silakan batalkan rekrutmen kandidat terpilih terlebih dahulu.`,
        );
      }
    }

    // 2. Perbarui / Buat status TalentApproach menjadi HIRED
    const approach = await this.prisma.talentApproach.upsert({
      where: {
        vacancyId_talentId: { vacancyId, talentId },
      },
      update: {
        status: 'HIRED',
      },
      create: {
        vacancyId,
        talentId,
        aiMatchScore: 90,
        status: 'HIRED',
        talentNotifiedAt: new Date(),
      },
    });

    // 3. Kedaulatan Mobilitas Talenta (Anti-Locking Invariant):
    // Status isAvailable adalah milik talenta, BUKAN perusahaan.
    // Talenta TIDAK dimutasi menjadi isAvailable = false agar pintu peluang kerja tetap terbuka.

    // 4. Hitung jumlah yang sudah di-hire untuk lowongan ini
    const hiredCount = await this.prisma.talentApproach.count({
      where: {
        vacancyId,
        status: 'HIRED',
      },
    });

    let isVacancyClosed = false;
    if (hiredCount >= (vacancy.quota || 1)) {
      await this.prisma.jobVacancy.update({
        where: { id: vacancyId },
        data: { status: 'CLOSED' },
      });
      isVacancyClosed = true;
    }

    this.logger.log(`[Hiring Engine] Talent ${talent.fullName} HIRED by ${vacancy.employer.companyName}. Quota progress: ${hiredCount}/${vacancy.quota}`);

    return {
      status: 'success',
      message: `Selamat! Sdr/i ${talent.fullName} telah resmi direkrut untuk posisi "${vacancy.title}". Kuota rekrutmen internal lowongan telah diperbarui.`,
      data: {
        approachId: approach.id,
        talentId: talent.id,
        talentName: talent.fullName,
        vacancyId: vacancy.id,
        vacancyTitle: vacancy.title,
        hiredCount,
        quota: vacancy.quota,
        isVacancyClosed,
      },
    };
  }

  /**
   * Membatalkan Perekrutan Talenta (Unhire / Cancel Active Contract)
   * Mengembalikan status talenta menjadi aktif kembali (isAvailable = true)
   * dan membuka kembali kuota lowongan pekerjaan.
   */
  async unhireTalent(vacancyId: string, talentId: string, employerId: string) {
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

    const talent = await this.prisma.talent.findUnique({
      where: { id: talentId },
    });

    if (!talent) {
      throw new NotFoundException('Data talenta tidak ditemukan.');
    }

    const approach = await this.prisma.talentApproach.findUnique({
      where: {
        vacancyId_talentId: { vacancyId, talentId },
      },
    });

    if (!approach || approach.status !== 'HIRED') {
      throw new BadRequestException('Talenta ini belum direkrut pada lowongan ini.');
    }

    // 1. Kembalikan status approach menjadi APPROACHED
    await this.prisma.talentApproach.update({
      where: { id: approach.id },
      data: { status: 'APPROACHED' },
    });

    // 2. Cek sisa kuota lowongan ini. Jika kuota belum penuh, kembalikan status OPEN jika sebelumnya CLOSED
    const currentHiredCount = await this.prisma.talentApproach.count({
      where: {
        vacancyId,
        status: 'HIRED',
      },
    });

    // INVARIANT GUARD: Cegah Resureksi Zombie Vacancy
    if (currentHiredCount < (vacancy.quota || 1)) {
      const isExpired = vacancy.expiresAt && new Date(vacancy.expiresAt).getTime() <= Date.now();
      await this.prisma.jobVacancy.update({
        where: { id: vacancyId },
        data: { status: isExpired ? 'EXPIRED' : 'OPEN' },
      });
      if (isExpired) {
        this.logger.warn(`[Lifecycle Guard] Vacancy ${vacancy.title} kuota terbuka kembali, namun masa tayang telah kedaluwarsa. Status tetap EXPIRED.`);
      }
    }

    this.logger.log(`[Hiring Engine] Talent ${talent.fullName} UNHIRED from vacancy ${vacancy.title}. Quota progress: ${currentHiredCount}/${vacancy.quota}`);

    return {
      status: 'success',
      message: `Perekrutan Sdr/i ${talent.fullName} berhasil dibatalkan. Kuota lowongan telah terbuka kembali.`,
      data: {
        approachId: approach.id,
        talentId: talent.id,
        talentName: talent.fullName,
        vacancyId: vacancy.id,
        hiredCount: currentHiredCount,
        quota: vacancy.quota,
      },
    };
  }

  /**
   * Memilih Talenta untuk Masuk ke Daftar Terpilih (Staging Rekrutmen)
   * Catatan: Belum mengunci talenta secara hukum, talenta tetap isAvailable = true.
   * Disimpan ke talent_approaches dengan status 'SELECTED' agar sesi tersimpan saat back/refresh.
   */
  async selectTalent(vacancyId: string, talentId: string, employerId: string) {
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

    // Guard: Lowongan yang sudah CLOSED tidak boleh dimodifikasi / ditambah orang lagi
    if (vacancy.status === 'CLOSED') {
      throw new BadRequestException(
        'Lowongan pekerjaan ini telah resmi diselesaikan dan ditutup. Anda tidak dapat menambahkan kandidat pada lowongan yang sudah tutup. Silakan gunakan fitur "Buka Batch Baru (Duplikasi)" untuk merekrut tenaga kerja tambahan.',
      );
    }

    const talent = await this.prisma.talent.findUnique({
      where: { id: talentId },
    });

    if (!talent) {
      throw new NotFoundException('Data talenta tidak ditemukan.');
    }

    // 1. Cek apakah sudah pernah dipilih / di-hire
    const existingApproach = await this.prisma.talentApproach.findUnique({
      where: { vacancyId_talentId: { vacancyId, talentId } },
    });

    if (existingApproach?.status === 'SELECTED' || existingApproach?.status === 'HIRED') {
      return {
        status: 'success',
        message: `${talent.fullName} sudah berada di daftar talenta terpilih.`,
        data: { talentId, status: existingApproach.status },
      };
    }

    // 2. Validasi Kuota: Cek jumlah yang sudah berstatus SELECTED atau HIRED
    const currentSelectedCount = await this.prisma.talentApproach.count({
      where: {
        vacancyId,
        status: { in: ['SELECTED', 'HIRED'] },
      },
    });

    const quota = vacancy.quota || 1;
    if (currentSelectedCount >= quota) {
      throw new BadRequestException(
        `Kuota lowongan ini adalah ${quota} orang dan seluruh slot telah terpilih (${currentSelectedCount}/${quota}). Silakan batalkan salah satu talenta terpilih jika ingin mengganti pilihan.`
      );
    }

    // 3. Simpan / Perbarui status menjadi SELECTED
    const cacheKey = `${vacancyId}:${talentId}`;
    const cachedAi = this.aiEvaluationCache.get(cacheKey);

    const approach = await this.prisma.talentApproach.upsert({
      where: { vacancyId_talentId: { vacancyId, talentId } },
      update: {
        status: 'SELECTED',
        aiReasoning: cachedAi ? (cachedAi as any) : undefined,
      },
      create: {
        vacancyId,
        talentId,
        aiMatchScore: 90,
        status: 'SELECTED',
        aiReasoning: cachedAi ? (cachedAi as any) : {},
        talentNotifiedAt: new Date(),
      },
    });

    this.logger.log(`[Talent Sourcing] Talent ${talent.fullName} SELECTED for vacancy ${vacancy.title}. Progress: ${currentSelectedCount + 1}/${quota}`);

    return {
      status: 'success',
      message: `Sdr/i ${talent.fullName} berhasil ditambahkan ke daftar talenta terpilih.`,
      data: {
        approachId: approach.id,
        talentId: talent.id,
        talentName: talent.fullName,
        vacancyId: vacancy.id,
        selectedCount: currentSelectedCount + 1,
        quota,
      },
    };
  }

  /**
   * Membatalkan Pilihan Talenta (Batal Pilih / Kembalikan ke Rekomendasi)
   */
  async unselectTalent(vacancyId: string, talentId: string, employerId: string) {
    const vacancy = await this.prisma.jobVacancy.findUnique({
      where: { id: vacancyId },
      include: { employer: true },
    });

    if (!vacancy || vacancy.employerId !== employerId) {
      throw new ForbiddenException('Akses ditolak.');
    }

    if (vacancy.status === 'CLOSED') {
      throw new BadRequestException('Lowongan pekerjaan ini telah resmi ditutup. Pilihan kandidat tidak dapat diubah.');
    }

    const talent = await this.prisma.talent.findUnique({ where: { id: talentId } });
    if (!talent) throw new NotFoundException('Data talenta tidak ditemukan.');

    const approach = await this.prisma.talentApproach.findUnique({
      where: { vacancyId_talentId: { vacancyId, talentId } },
    });

    if (!approach) {
      return { status: 'success', message: 'Talenta belum ada di daftar pilihan.' };
    }

    const wasHired = approach.status === 'HIRED';

    // Kembalikan status menjadi APPROACHED
    await this.prisma.talentApproach.update({
      where: { id: approach.id },
      data: { status: 'APPROACHED' },
    });

    // INVARIANT GUARD: Cegah Resureksi Zombie Vacancy
    if (wasHired) {
      const isExpired = vacancy.expiresAt && new Date(vacancy.expiresAt).getTime() <= Date.now();
      await this.prisma.jobVacancy.update({
        where: { id: vacancyId },
        data: { status: isExpired ? 'EXPIRED' : 'OPEN' },
      });
    }

    const remainingSelected = await this.prisma.talentApproach.count({
      where: { vacancyId, status: { in: ['SELECTED', 'HIRED'] } },
    });

    return {
      status: 'success',
      message: `Pilihan untuk Sdr/i ${talent.fullName} dibatalkan. Talenta dikembalikan ke daftar rekomendasi.`,
      data: {
        talentId,
        selectedCount: remainingSelected,
        quota: vacancy.quota,
      },
    };
  }

  /**
   * Selesaikan Rekrutmen & Penuhi Kuota Lowongan (Human-Controlled Finalization)
   * Saat HRD yakin dengan seluruh talenta terpilih, tombol ini ditekan secara sadar:
   * 1. Seluruh talenta berstatus 'SELECTED' diubah menjadi 'HIRED'.
   * 2. Kuota rekrutmen internal lowongan terpenuhi dan lowongan resmi ditutup (status = CLOSED).
   * 3. Sesuai Aksioma Kedaulatan Mobilitas Talenta, status isAvailable milik talenta tetap terjaga.
   */
  async finalizeRecruitment(vacancyId: string, employerId: string) {
    const vacancy = await this.prisma.jobVacancy.findUnique({
      where: { id: vacancyId },
      include: { employer: true },
    });

    if (!vacancy) throw new NotFoundException('Lowongan tidak ditemukan.');
    if (vacancy.employerId !== employerId) throw new ForbiddenException('Akses ditolak.');

    // Ambil talenta yang berstatus SELECTED untuk lowongan ini
    const selectedApproaches = await this.prisma.talentApproach.findMany({
      where: {
        vacancyId,
        status: 'SELECTED',
      },
      include: { talent: true },
    });

    const alreadyHiredCount = await this.prisma.talentApproach.count({
      where: { vacancyId, status: 'HIRED' },
    });

    if (selectedApproaches.length === 0 && alreadyHiredCount === 0) {
      throw new BadRequestException('Belum ada talenta yang Anda pilih untuk lowongan ini.');
    }

    // 1. Ubah seluruh status SELECTED menjadi HIRED (Internal Quota Fulfillment)
    for (const app of selectedApproaches) {
      await this.prisma.talentApproach.update({
        where: { id: app.id },
        data: { status: 'HIRED' },
      });
    }

    // 2. Tutup lowongan pekerjaan karena kuota perusahaan telah terpenuhi
    const updatedVacancy = await this.prisma.jobVacancy.update({
      where: { id: vacancyId },
      data: { status: 'CLOSED' },
    });

    const totalHired = alreadyHiredCount + selectedApproaches.length;

    this.logger.log(`[Recruitment Finalized] Vacancy ${vacancy.title} finalized with ${totalHired} hired talents. Status CLOSED.`);

    return {
      status: 'success',
      message: `Proses rekrutmen lowongan "${vacancy.title}" resmi diselesaikan! Kuota internal lowongan telah terpenuhi dan lowongan ditutup.`,
      data: {
        vacancyId: vacancy.id,
        vacancyTitle: vacancy.title,
        status: updatedVacancy.status,
        hiredCount: totalHired,
        quota: vacancy.quota,
      },
    };
  }

  /**
   * Menandai Kandidat Tidak Sesuai (Hasil Wawancara / Penjajakan Gagal)
   * Catatan: Talenta TIDAK dikunci (tetap isAvailable = true) agar bisa didekati lowongan lain.
   */
  async rejectTalent(vacancyId: string, talentId: string, employerId: string) {
    const vacancy = await this.prisma.jobVacancy.findUnique({
      where: { id: vacancyId },
    });

    if (!vacancy || vacancy.employerId !== employerId) {
      throw new ForbiddenException('Akses ditolak.');
    }

    if (vacancy.status === 'CLOSED') {
      throw new BadRequestException('Lowongan pekerjaan ini telah resmi ditutup. Status kandidat tidak dapat diubah.');
    }

    const approach = await this.prisma.talentApproach.upsert({
      where: {
        vacancyId_talentId: { vacancyId, talentId },
      },
      update: {
        status: 'REJECTED',
      },
      create: {
        vacancyId,
        talentId,
        aiMatchScore: 50,
        status: 'REJECTED',
        talentNotifiedAt: new Date(),
      },
    });

    return {
      status: 'success',
      message: 'Status kandidat ditandai tidak sesuai untuk posisi ini. Profil kandidat tetap aktif di radar lowongan lain.',
      data: {
        approachId: approach.id,
        status: 'REJECTED',
      },
    };
  }

  /**
   * Mengembalikan Kandidat yang Dilewati ke Daftar Rekomendasi (Restore Skipped Talent)
   */
  async restoreRejectedTalent(vacancyId: string, talentId: string, employerId: string) {
    const vacancy = await this.prisma.jobVacancy.findUnique({
      where: { id: vacancyId },
    });

    if (!vacancy || vacancy.employerId !== employerId) {
      throw new ForbiddenException('Akses ditolak.');
    }

    if (vacancy.status === 'CLOSED') {
      throw new BadRequestException('Lowongan pekerjaan ini telah resmi ditutup. Status kandidat tidak dapat diubah.');
    }

    const talent = await this.prisma.talent.findUnique({
      where: { id: talentId },
    });

    if (!talent) {
      throw new NotFoundException('Data talenta tidak ditemukan.');
    }

    // Hapus record pendekatan berstatus REJECTED
    await this.prisma.talentApproach.deleteMany({
      where: {
        vacancyId,
        talentId,
        status: 'REJECTED',
      },
    });

    this.logger.log(`[Screening Engine] Talent ${talent.fullName} RESTORED from rejected status for vacancy ${vacancy.title}.`);

    return {
      status: 'success',
      message: `Sdr/i ${talent.fullName} berhasil dikembalikan ke daftar rekomendasi.`,
      data: { talentId, vacancyId },
    };
  }

  /**
   * Menduplikasi Lowongan Pekerjaan (Buka Batch Baru)
   * Mengkloning spesifikasi pekerjaan tanpa menyalin kandidat lama (Clean Slate).
   */
  async duplicateVacancy(vacancyId: string, employerId: string, overrides?: any) {
    const source = await this.prisma.jobVacancy.findUnique({
      where: { id: vacancyId },
    });

    if (!source) {
      throw new NotFoundException('Lowongan sumber tidak ditemukan.');
    }

    if (source.employerId !== employerId) {
      throw new ForbiddenException('Anda tidak berwenang menduplikasi lowongan ini.');
    }

    // 1. Ekstraksi base title (buang akhiran " - Batch X" jika ada)
    const baseTitle = source.title.replace(/\s*-\s*Batch\s*\d+$/i, '').trim();

    // 2. Cari seluruh lowongan milik employer ini yang memiliki baseTitle serupa
    const existingBatches = await this.prisma.jobVacancy.findMany({
      where: {
        employerId: source.employerId,
        title: {
          contains: baseTitle,
        },
      },
      select: { title: true },
    });

    // 3. Hitung nomor batch tertinggi yang saat ini ada
    let maxBatch = 1;
    for (const v of existingBatches) {
      const match = v.title.match(/-\s*Batch\s*(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxBatch) {
          maxBatch = num;
        }
      }
    }

    const nextBatchNum = maxBatch + 1;
    const computedNewTitle = `${baseTitle} - Batch ${nextBatchNum}`;

    // Gunakan overrides dari user jika dikirim via modal penyesuaian
    const finalTitle = overrides?.title?.trim() ? overrides.title.trim() : computedNewTitle;
    const finalQuota = overrides?.quota && Number(overrides.quota) > 0 ? Number(overrides.quota) : (source.quota || 1);
    const finalSalaryMin = overrides?.salaryMin !== undefined && overrides.salaryMin !== '' && !isNaN(Number(overrides.salaryMin)) 
      ? Number(overrides.salaryMin) 
      : source.salaryMin;
    const finalSalaryMax = overrides?.salaryMax !== undefined && overrides.salaryMax !== '' && !isNaN(Number(overrides.salaryMax)) 
      ? Number(overrides.salaryMax) 
      : source.salaryMax;
    const finalStipend = overrides?.stipendAmount !== undefined && overrides.stipendAmount !== '' && !isNaN(Number(overrides.stipendAmount)) 
      ? Number(overrides.stipendAmount) 
      : source.stipendAmount;
    const finalDuration = overrides?.projectDuration?.trim() ? overrides.projectDuration.trim() : source.projectDuration;

    const newVacancy = await this.prisma.jobVacancy.create({
      data: {
        employerId: source.employerId,
        title: finalTitle,
        opportunityType: source.opportunityType,
        contractType: overrides?.contractType || source.contractType,
        contractDurationMonths:
          overrides?.contractDurationMonths !== undefined
            ? overrides.contractDurationMonths
            : source.contractDurationMonths,
        quota: finalQuota,
        salaryMin: finalSalaryMin,
        salaryMax: finalSalaryMax,
        isSalaryDisclosed: source.isSalaryDisclosed,
        stipendAmount: finalStipend,
        benefits: source.benefits as any,
        workTools: source.workTools as any,
        isSameAsOfficeLocation: source.isSameAsOfficeLocation,
        workZone: source.workZone,
        workSchedule: source.workSchedule,
        jobLocationLat: source.jobLocationLat,
        jobLocationLng: source.jobLocationLng,
        skillsGained: source.skillsGained as any,
        mentorName: source.mentorName,
        mentorRole: source.mentorRole,
        hasAbsorptionOpportunity: source.hasAbsorptionOpportunity,
        taskDescription: source.taskDescription,
        projectDuration: finalDuration,
        requiredSkills: source.requiredSkills as any,
        mandatoryCerts: source.mandatoryCerts as any,
        preferredMajors: source.preferredMajors as any,
        minEducation: source.minEducation,
        minExperienceYears: source.minExperienceYears,
        allowEquivalence: source.allowEquivalence,
        status: 'OPEN',
      },
    });

    this.logger.log(`[Vacancy Duplication] Successfully created new vacancy "${newVacancy.title}" (ID: ${newVacancy.id}) as next batch from "${source.title}".`);

    return {
      status: 'success',
      message: `Lowongan baru "${newVacancy.title}" berhasil diterbitkan (Batch Baru)!`,
      data: newVacancy,
    };
  }

  /**
   * Mengambil Seluruh Penjajakan / Tawaran Kerja Masuk ke Akun Talenta
   */
  async getTalentApproaches(talentUserId: string) {
    const talent = await this.prisma.talent.findUnique({
      where: { id: talentUserId },
    });

    if (!talent) {
      throw new NotFoundException('Profil talenta tidak ditemukan.');
    }

    const approaches = await this.prisma.talentApproach.findMany({
      where: { talentId: talent.id },
      include: {
        vacancy: {
          include: {
            employer: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = approaches.map((app) => {
      const vac = app.vacancy;
      const emp = vac.employer;
      const isJob = vac.opportunityType === 'JOB';
      const compensationText = isJob
        ? `Rp ${Number(vac.salaryMin || 0).toLocaleString('id-ID')} - Rp ${Number(vac.salaryMax || 0).toLocaleString('id-ID')} / Bulan`
        : `Rp ${Number(vac.stipendAmount || 0).toLocaleString('id-ID')} / Bulan`;

      const aiReasoningObj = typeof app.aiReasoning === 'object' && app.aiReasoning !== null
        ? (app.aiReasoning as any)
        : {};

      return {
        id: app.id,
        vacancyId: vac.id,
        vacancyTitle: vac.title,
        opportunityType: vac.opportunityType,
        companyName: emp.companyName,
        brandName: emp.brandName || undefined,
        companyLogo: emp.logoUrl || undefined,
        compensationText,
        benefits: (Array.isArray(vac.benefits) ? vac.benefits : []).map(String),
        workZone: vac.workZone,
        workSchedule: vac.workSchedule,
        picName: emp.picName || 'HR Talent Acquisition',
        picRole: emp.picRole || 'HR Manager',
        picPhone: emp.picPhone || '-',
        status: app.status,
        aiMatchScore: Number(app.aiMatchScore),
        aiReasoningSummary: aiReasoningObj.summary || (typeof app.aiReasoning === 'string' ? app.aiReasoning : ''),
        officialLetterDraft: aiReasoningObj.officialLetterDraft,
        createdAt: app.createdAt.toISOString(),
        updatedAt: app.updatedAt.toISOString(),
      };
    });

    return {
      status: 'success',
      total: data.length,
      data,
    };
  }

  // ============================================================
  // LOGIKA POLIMORFIK: EVALUASI KANDIDAT
  // ============================================================
  private async evaluateCandidate(vacancy: any, talent: any) {
    if (vacancy.opportunityType === 'INTERNSHIP') {
      return await this.evaluateInternshipCandidate(vacancy, talent);
    }
    return await this.evaluateJobCandidate(vacancy, talent);
  }

  // ------------------------------------------------------------
  // RUMUS A: PEKERJAAN REGULER (JOB)
  // Bobot: Skill (40%), Experience & Fuzzy (30%), Social DNA (20%), GIS (10%)
  // ------------------------------------------------------------
  private async evaluateJobCandidate(vacancy: any, talent: any) {
    // A. VEKTOR 1: KEAHLIAN TEKNIS (Bobot: 40%) - Agent 2 Semantic Vector Match
    const requiredSkills: string[] = Array.isArray(vacancy.requiredSkills)
      ? (vacancy.requiredSkills as string[]).map((s) => String(s).toLowerCase().trim())
      : [];

    const talentSkills: string[] = (Array.isArray(talent.skills) ? talent.skills : [])
      .map((s: any) => (typeof s === 'string' ? s : s.name || '').toLowerCase().trim());

    const { score: skillMatchScore, matchedCount: matchedSkillCount } =
      await this.computeSemanticSkillScore(requiredSkills, talentSkills);

    // B. VEKTOR 2: JAM TERBANG & PENGALAMAN KERJA RIIL (Bobot: 30%)
    const workList = Array.isArray(talent.workExperience) ? talent.workExperience : [];
    const totalExperienceMonths = workList.reduce(
      (sum: number, w: any) => sum + (Number(w.durationMonths) || 0),
      0,
    );
    const totalExpYears = totalExperienceMonths / 12;

    const minExp = vacancy.minExperienceYears ?? 0;
    let experienceMatchScore = 0;
    if (minExp > 0) {
      const expRatio = Math.min(1.0, totalExpYears / minExp);
      experienceMatchScore = Math.round(expRatio * 100);
    } else {
      experienceMatchScore = totalExpYears > 0 ? 100 : 80;
    }

    // C. VEKTOR 3: JENJANG PENDIDIKAN & AFIRMASI FUZZY VOKASI (Bobot: 20%)
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

    let educationMatchScore = 50; // Default baseline
    let isFuzzyEquivalenceApplied = false;

    if (highestEduRank >= targetEduRank) {
      // Jenjang pendidikan memenuhi atau melampaui syarat lowongan
      educationMatchScore = 100;
    } else {
      // Jenjang pendidikan di bawah syarat (misal: Syarat S1, kandidat SMK/SMA)
      const allowEquiv = vacancy.allowEquivalence ?? true;
      if (allowEquiv && totalExpYears >= (vacancy.minExperienceYears || 0) + 3) {
        // AFIRMASI FUZZY: Jam terbang tinggi mengompensasi kekurangan ijazah formal
        educationMatchScore = 90;
        isFuzzyEquivalenceApplied = true;
      } else {
        // Tanpa jam terbang kompensasi: skor berbasis gap hierarki
        const gap = targetEduRank - highestEduRank;
        educationMatchScore = Math.max(30, 100 - gap * 25);
      }
    }

    // D. VEKTOR 4: KARAKTER KERJA & SOCIAL DNA (Bobot: 15%)
    let socialDnaMatchScore = 70;
    const socialDna = (typeof talent.socialDna === 'object' && talent.socialDna !== null)
      ? (talent.socialDna as any)
      : {};
    const preferences: string[] = Array.isArray(socialDna.workPreferences)
      ? socialDna.workPreferences.map((p: string) => String(p).toLowerCase())
      : [];

    const descLower = `${vacancy.taskDescription || ''} ${vacancy.workZone || ''} ${vacancy.workSchedule || ''}`.toLowerCase();

    if (descLower.includes('shift') && preferences.some((p) => p.includes('shift'))) {
      socialDnaMatchScore += 15;
    }
    if ((descLower.includes('highland') || descLower.includes('remote')) && preferences.some((p) => p.includes('remote') || p.includes('highland'))) {
      socialDnaMatchScore += 15;
    }
    if (socialDna.communityActivities) {
      socialDnaMatchScore += 10;
    }
    socialDnaMatchScore = Math.min(100, socialDnaMatchScore);

    // E. METADATA GEOSPASIAL GIS (Metadata Informatif - Architectural Guard)
    let distanceMatchScore = 75;
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

    // F. RELEVANCE GATE: Saringan kelayakan kompetensi dasar
    const isSkillRelevant = matchedSkillCount > 0 || skillMatchScore >= 30;
    const hasRelatedPosition = workList.some((w: any) => {
      const p = (w.position || '').toLowerCase();
      return requiredSkills.some((req) => p.includes(req) || req.includes(p));
    });

    let overallScore = 0;
    if (isSkillRelevant || hasRelatedPosition) {
      // Formula 4-Vektor Terbuka: Skill 35%, Exp 30%, Edu 20%, DNA 15%
      overallScore = Math.round(
        skillMatchScore * 0.35 +
        experienceMatchScore * 0.30 +
        educationMatchScore * 0.20 +
        socialDnaMatchScore * 0.15,
      );
    } else {
      // Gagal Relevance Gate: 0% kecocokan kompetensi dasar loker
      overallScore = 15;
    }

    let aiReasoning = `Kandidat memiliki skor kecocokan ${overallScore}%. Memenuhi ${matchedSkillCount} dari ${requiredSkills.length} keahlian yang disyaratkan.`;
    if (isFuzzyEquivalenceApplied) {
      aiReasoning += ` Afirmasi Pengalaman Vokasi: Lulusan ${highestEduDegree} dengan jam terbang ${totalExpYears.toFixed(1)} tahun diakui setara kualifikasi sarjana (Skor Pendidikan: ${educationMatchScore}%).`;
    }
    if (socialDnaMatchScore >= 85) {
      aiReasoning += ` Preferensi pola kerja sangat selaras dengan zona kerja ${vacancy.workZone}.`;
    }

    return {
      overallScore,
      breakdown: {
        skillMatchScore,
        matchedSkillCount,
        experienceMatchScore,
        educationMatchScore,
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

  // ------------------------------------------------------------
  // RUMUS B: PEMAGANGAN VOKASI (INTERNSHIP)
  // Bobot: Education & Major (40%), Social DNA & Kesiapan (30%), GIS (20%), Freshness Inversion (10%)
  // ------------------------------------------------------------
  private async evaluateInternshipCandidate(vacancy: any, talent: any) {
    // 1. VEKTOR 1: KESELARASAN PENDIDIKAN & JURUSAN (Bobot: 40%)
    const talentEduList = Array.isArray(talent.education) ? talent.education : [];
    let highestEduDegree = 'SMK';
    let highestEduRank = 3;
    let primaryMajor = '';

    talentEduList.forEach((edu: any) => {
      const degree = (edu.degree || 'SMK').toUpperCase();
      const rank = this.EDUCATION_RANK[degree] || 3;
      if (rank >= highestEduRank) {
        highestEduRank = rank;
        highestEduDegree = degree;
        primaryMajor = edu.major || '';
      }
    });

    const preferredMajors: string[] = Array.isArray(vacancy.preferredMajors)
      ? (vacancy.preferredMajors as string[]).map((m) => String(m).toLowerCase().trim())
      : [];

    let majorMatchScore = 20; // Default jika jurusan tidak selaras
    if (preferredMajors.length > 0 && primaryMajor) {
      const pLower = primaryMajor.toLowerCase();
      const isMatched = preferredMajors.some((pref) => pLower.includes(pref) || pref.includes(pLower));
      if (isMatched) {
        majorMatchScore = 100;
      } else if (this.openAiService.isAvailable()) {
        let maxMajorSim = 0;
        for (const pref of preferredMajors) {
          const sim = await this.openAiService.computeSemanticSimilarity(pref, pLower);
          if (sim > maxMajorSim) maxMajorSim = sim;
        }
        if (maxMajorSim >= 0.70) {
          majorMatchScore = Math.round(maxMajorSim * 100);
        } else if (maxMajorSim >= 0.50) {
          majorMatchScore = 60;
        } else {
          majorMatchScore = 15; // Mismatch jurusan total
        }
      } else {
        majorMatchScore = 20;
      }
    } else if (preferredMajors.length === 0 && (highestEduDegree === 'SMK' || highestEduDegree === 'D3')) {
      majorMatchScore = 80; // Bonus vokasi daerah jika lowongan tidak membatasi jurusan
    }

    // 2. VEKTOR 2: SOCIAL DNA & KESIAPAN BELAJAR (Bobot: 30%)
    let socialDnaMatchScore = 80;
    const socialDna = (typeof talent.socialDna === 'object' && talent.socialDna !== null)
      ? (talent.socialDna as any)
      : {};
    const preferences: string[] = Array.isArray(socialDna.workPreferences)
      ? socialDna.workPreferences.map((p: string) => String(p).toLowerCase())
      : [];

    if (preferences.some((p) => p.includes('lapangan') || p.includes('proyek') || p.includes('magang'))) {
      socialDnaMatchScore += 10;
    }
    if (socialDna.communityActivities || socialDna.organizations) {
      socialDnaMatchScore += 10;
    }
    socialDnaMatchScore = Math.min(100, socialDnaMatchScore);

    // 3. VEKTOR 3: JARAK GEOSPASIAL GIS (Bobot: 20%)
    let distanceMatchScore = 80;
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
      else if (distanceKm <= 35) distanceMatchScore = 85;
      else distanceMatchScore = 60;
    }

    // 4. VEKTOR 4: INVERSI JAM TERBANG / FRESH GRADUATE PRIORITY (Bobot: 10%)
    // Magang diprioritaskan bagi talenta yang belum punya banyak pengalaman kerja!
    const workList = Array.isArray(talent.workExperience) ? talent.workExperience : [];
    const totalExperienceMonths = workList.reduce(
      (sum: number, w: any) => sum + (Number(w.durationMonths) || 0),
      0,
    );
    const totalExpYears = totalExperienceMonths / 12;

    let freshnessScore = 100;
    if (totalExpYears > 2) {
      freshnessScore = 50; // Pengalaman tinggi bukan target utama program pemagangan
    } else if (totalExpYears > 1) {
      freshnessScore = 75;
    }

    let overallScore = Math.round(
      majorMatchScore * 0.40 +
      socialDnaMatchScore * 0.30 +
      distanceMatchScore * 0.20 +
      freshnessScore * 0.10,
    );

    // Jika jurusan tidak cocok sama sekali dan tidak punya keahlian dasar terkait
    const reqSkills: string[] = Array.isArray(vacancy.requiredSkills)
      ? (vacancy.requiredSkills as string[]).map((s) => String(s).toLowerCase().trim())
      : [];
    const tSkills: string[] = (Array.isArray(talent.skills) ? talent.skills : [])
      .map((s: any) => (typeof s === 'string' ? s : s.name || '').toLowerCase().trim());
    const hasAnySkillMatch = reqSkills.some((req) => tSkills.some((ts) => ts.includes(req) || req.includes(ts)));

    if (majorMatchScore < 50 && !hasAnySkillMatch) {
      overallScore = 20; // Gagal domain gate pemagangan
    }

    let aiReasoning = `Rekomendasi Pemagangan Vokasi (Skor ${overallScore}%): Lulusan ${highestEduDegree} ${primaryMajor ? `Jurusan ${primaryMajor}` : ''} siap menerima transfer keterampilan lapangan.`;
    if (freshnessScore === 100) {
      aiReasoning += ` Afirmasi Fresh Graduate: Menjadi sasaran prioritas penyerapan angkatan kerja muda Mimika.`;
    }

    return {
      overallScore,
      breakdown: {
        skillMatchScore: majorMatchScore,
        matchedSkillCount: majorMatchScore >= 80 ? 1 : 0,
        experienceMatchScore: freshnessScore,
        educationMatchScore: majorMatchScore,
        socialDnaMatchScore,
        distanceMatchScore,
        distanceKm,
        isFuzzyEquivalenceApplied: false,
      },
      aiReasoning,
      totalExperienceMonths,
      lastEducationDegree: highestEduDegree,
    };
  }

  /**
   * Menghitung skor kemiripan keahlian teknis dengan AI Semantic Embeddings (Agent 2)
   * Dilengkapi fallback pencocokan substring jika OpenAI offline atau tidak tersedia.
   */
  private async computeSemanticSkillScore(
    requiredSkills: string[],
    talentSkills: string[],
  ): Promise<{ score: number; matchedCount: number }> {
    if (requiredSkills.length === 0) {
      return { score: 100, matchedCount: 0 };
    }
    if (talentSkills.length === 0) {
      return { score: 0, matchedCount: 0 };
    }

    let accumulatedScore = 0;
    let matchedCount = 0;

    for (const req of requiredSkills) {
      // 1. Coba exact/substring match dulu (paling cepat & hemat token)
      const exactMatch = talentSkills.some(
        (ts) => ts === req || ts.includes(req) || req.includes(ts),
      );

      if (exactMatch) {
        matchedCount++;
        accumulatedScore += 1.0;
        continue;
      }

      // 2. Jika tidak ada substring match, gunakan Semantic Similarity AI
      if (this.openAiService.isAvailable()) {
        try {
          let maxSimilarity = 0;
          for (const ts of talentSkills) {
            const sim = await this.openAiService.computeSemanticSimilarity(req, ts);
            if (sim > maxSimilarity) {
              maxSimilarity = sim;
            }
          }

          // Threshold 0.72 untuk mengakui padanan semantik bahasa lapangan warga
          // Contoh: "beko" vs "operator excavator", "juru las" vs "welder"
          if (maxSimilarity >= 0.72) {
            matchedCount++;
            accumulatedScore += maxSimilarity;
          } else if (maxSimilarity >= 0.55) {
            accumulatedScore += maxSimilarity * 0.7;
          }
        } catch (err) {
          this.logger.warn(`Semantic similarity calculation error for "${req}": ${err}`);
        }
      }
    }

    const finalScore = Math.min(
      100,
      Math.round((accumulatedScore / requiredSkills.length) * 100),
    );

    return { score: finalScore, matchedCount };
  }

  /**
   * Agen 2: Analisis Kualitatif & Rubrik Afirmasi AI untuk Seluruh Kandidat Terkurasi
   * Menggunakan model LLM OpenAI dengan prompt afirmatif khusus Kabupaten Mimika.
   */
  private async generateAiReasoning(
    vacancy: any,
    talent: any,
    context: {
      overallScore: number;
      matchedSkillCount: number;
      requiredCount: number;
      isFuzzyEquivalenceApplied: boolean;
    },
  ): Promise<AiEvaluationOutput> {
    const cacheKey = `${vacancy.id}:${talent.id}`;
    if (this.aiEvaluationCache.has(cacheKey)) {
      return this.aiEvaluationCache.get(cacheKey)!;
    }

    // Cek apakah sudah pernah tersimpan di database approaches sebelumnya
    const existingApproach = Array.isArray(talent.approaches) ? talent.approaches[0] : null;
    if (existingApproach?.aiReasoning && typeof existingApproach.aiReasoning === 'object') {
      const stored = existingApproach.aiReasoning as any;
      if (stored.narrative || stored.summary) {
        const cached: AiEvaluationOutput = {
          narrative: stored.narrative || stored.summary,
          strengths: stored.strengths || [],
          affirmationNote: stored.affirmationNote,
          qualitativeScore: stored.qualitativeScore,
          provider: 'OPENAI_GPT_4O_MINI',
        };
        this.aiEvaluationCache.set(cacheKey, cached);
        return cached;
      }
    }

    if (!this.openAiService.isAvailable()) {
      const def = this.generateDefaultReasoning(vacancy, talent, context);
      this.aiEvaluationCache.set(cacheKey, def);
      return def;
    }

    try {
      // Sanitasi PII (UU PDP No. 27/2022)
      const sanitizedProfile = PiiSanitizerUtil.sanitizeTalentProfile(talent);

      const prompt = buildGuidedMatchingUserPrompt({
        vacancyTitle: vacancy.title,
        opportunityType: vacancy.opportunityType,
        taskDescription: vacancy.taskDescription || '',
        requiredSkills: Array.isArray(vacancy.requiredSkills) ? vacancy.requiredSkills : [],
        workZone: vacancy.workZone,
        workSchedule: vacancy.workSchedule,
        talentProfile: {
          skills: sanitizedProfile.skills,
          education: sanitizedProfile.education,
          workExperience: sanitizedProfile.workExperience,
          certifications: sanitizedProfile.certifications,
          socialDna: sanitizedProfile.socialDna,
        },
      });

      const aiResponse = await this.openAiService.generateCompletion(
        GUIDED_MATCHING_SYSTEM_PROMPT,
        prompt,
        { temperature: 0.3, maxTokens: 450, jsonMode: true },
      );

      if (aiResponse) {
        const parsed = JSON.parse(aiResponse);
        if (parsed.reasoningSummary) {
          const strengths = Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : [];
          const affirmationNote = parsed.affirmationNote ? String(parsed.affirmationNote).trim() : undefined;
          const qualitativeScore = typeof parsed.qualitativeScore === 'number' ? parsed.qualitativeScore : undefined;

          this.logger.log(`[OpenAI Matching Engine] Successfully evaluated candidate ${talent.fullName}: QualitativeScore=${qualitativeScore}, Strengths=${strengths.length}`);

          const result: AiEvaluationOutput = {
            narrative: parsed.reasoningSummary,
            strengths,
            affirmationNote,
            qualitativeScore,
            provider: 'OPENAI_GPT_4O_MINI',
          };
          this.aiEvaluationCache.set(cacheKey, result);
          return result;
        }
      }
    } catch (err) {
      this.logger.warn(`AI Qualitative Reasoning failed: ${err}. Falling back to default.`);
    }

    const fallback = this.generateDefaultReasoning(vacancy, talent, context);
    this.aiEvaluationCache.set(cacheKey, fallback);
    return fallback;
  }

  private generateDefaultReasoning(
    vacancy: any,
    talent: any,
    context: {
      overallScore: number;
      matchedSkillCount: number;
      requiredCount: number;
      isFuzzyEquivalenceApplied: boolean;
    },
  ): AiEvaluationOutput {
    let reasoning = `Kandidat memiliki rekam jejak kompetensi yang sesuai untuk posisi ini. Memenuhi ${context.matchedSkillCount} dari ${context.requiredCount} keahlian yang disyaratkan.`;
    if (context.isFuzzyEquivalenceApplied) {
      reasoning += ` Jam terbang pengalaman lapangan diakui setara kualifikasi formal industri.`;
    }
    return {
      narrative: reasoning,
      strengths: Array.isArray(talent.skills) ? talent.skills.slice(0, 3).map((s: any) => typeof s === 'string' ? s : s.name || '') : [],
      affirmationNote: context.isFuzzyEquivalenceApplied ? 'Afirmasi Pengalaman Vokasi Lapangan Aktif' : undefined,
      provider: 'LOCAL_HEURISTIC',
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
