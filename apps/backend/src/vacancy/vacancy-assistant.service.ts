import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VacancySuggestionDto, AiVacancyAssistResponseDto } from '@mimika-talenta/shared-types';
import { OpenAiService } from '../ai/openai.service';
import {
  VACANCY_COPILOT_SYSTEM_PROMPT,
  buildPolishTasksUserPrompt,
  buildSuggestCriteriaUserPrompt,
} from '../ai/prompts/vacancy-copilot.prompt';

@Injectable()
export class VacancyAssistantService {
  private readonly logger = new Logger(VacancyAssistantService.name);

  // Kamus Domain & Inventaris Kerja Resmi (Pure Fabrication)
  private readonly CATEGORY_TOOLS: Record<string, { label: string; defaultEducation: string; tools: string[]; defaultSkills: string[] }> = {
    DIGITAL_IT: {
      label: 'Teknologi Informasi & Digital',
      defaultEducation: 'D3',
      tools: [
        'Laptop Spesifikasi Tinggi / Workstation',
        'Akses Cloud & VPN Kantor',
        'Monitor Eksternal Ganda',
        'Lisensi Software & Perangkat IDE Resmi',
        'Tunjangan Komunikasi & Internet',
      ],
      defaultSkills: [
        'Fullstack Developer',
        'Frontend Developer (React / Next.js)',
        'Backend Developer (Node.js / NestJS / Go)',
        'Database Administrator (PostgreSQL)',
        'UI/UX Designer (Figma)',
        'IT Technical Support & Hardware',
      ],
    },
    TAMBANG_ALAT_BERAT: {
      label: 'Pertambangan & Alat Berat',
      defaultEducation: 'SMK',
      tools: [
        'Perlengkapan APD K3 Minerba Lengkap',
        'Radio Komunikasi Rig / Handy Talkie (HT)',
        'Toolkit Mekanik Set',
        'Kendaraan Operasional LV Site Tambang',
        'Sepatu Safety Tambang Tahan Air & Benturan',
      ],
      defaultSkills: [
        'Operator Excavator (PC200 / PC400 / PC2000)',
        'Operator Off-Highway Dump Truck (CAT 777)',
        'Operator Bulldozer (CAT D85 / D375)',
        'Mekanik Alat Berat (Heavy Equipment)',
        'Auto Electrician Alat Berat',
        'Juru Ukur Tambang (Mine Surveyor)',
      ],
    },
    WELDING_FABRIKASI: {
      label: 'Pengelasan & Fabrikasi Baja',
      defaultEducation: 'SMK',
      tools: [
        'Kedok Las Auto-Darkening',
        'Jaket & Sarung Tangan Kulit Tahan Panas',
        'Mesin Las Inverter & Perlengkapan Elektroda',
        'Blower Ventilasi & Masker Respirator Partikel',
        'Grinding Toolkit & Tool Box Khusus',
      ],
      defaultSkills: [
        'Juru Las SMAW 3G / 4G Pelat',
        'Juru Las GTAW (Argon) 6G Pipa',
        'Juru Las GMAW / FCAW (MIG/CO2)',
        'Pipe Fitter & Pemotong Oksi-Asetilen',
        'Scaffolder Bersertifikat BNSP',
        'Steel Fabricator Konstruksi Baja',
      ],
    },
    ELEKTRIKAL: {
      label: 'Kelistrikan & Otomasi Industri',
      defaultEducation: 'SMK',
      tools: [
        'Digital Multimeter & Clamp Meter Kategori III/IV',
        'Insulated Hand Tools 1000V',
        'Safety Harness & Helm Elektrikal Anti-Strum',
        'Alat Ukur Megger Insulation Tester',
        'Laptop Pemrograman PLC & Kabel Antarmuka',
      ],
      defaultSkills: [
        'Teknisi Listrik Industri (Industrial Electrician)',
        'Teknisi Instrumentasi & Kontrol Otomasi PLC',
        'Teknisi Pendingin & Tata Udara (HVAC / Chiller)',
        'Drafter AutoCAD / BIM Elektrikal',
        'Operator Pembangkit Listrik (Power Plant)',
      ],
    },
    K3_SAFETY: {
      label: 'Kesehatan & Keselamatan Kerja (K3)',
      defaultEducation: 'D3',
      tools: [
        'Multi-Gas Detector Portable 4-Gas',
        'Seragam Inspektur K3 & Rompi Visibilitas Tinggi',
        'Kamera Dokumentasi Inspeksi & Tablet Audit',
        'Alat Ukur Kebisingan (Sound Level Meter)',
        'Radio Komunikasi Darurat 2-Way',
      ],
      defaultSkills: [
        'Ahli K3 Umum (AK3U Kemnaker)',
        'Ahli K3 Pertambangan & Pengendalian Resiko',
        'Paramedis Lapangan & First Aider',
        'Petugas Pemadam Kebakaran Industri',
        'Pengawas Pengelolaan Limbah B3',
      ],
    },
    LOGISTIK_ADMIN: {
      label: 'Logistik, Pergudangan & Administrasi',
      defaultEducation: 'SMA',
      tools: [
        'Komputer Kerja Desktop & Barcode Scanner',
        'Sepatu Safety Gudang Ringan (Steel Toe)',
        'Printer Label Thermal & Form Manifest Digital',
        'Radio Komunikasi Staf Pergudangan',
        'Rompi Safety Lapangan',
      ],
      defaultSkills: [
        'Warehouse & Inventory Specialist',
        'Logistics Coordinator & Fleet Dispatcher',
        'Staff Administrasi Perkantoran & ERP',
        'Operator Forklift Bersertifikat SIO',
        'Procurement & Purchasing Staff',
      ],
    },
    HOSPITALITY_FNB: {
      label: 'Perhotelan, Kafe & Jasa Boga',
      defaultEducation: 'SMA',
      tools: [
        'Seragam Kerja Resmi & Celemek Higienis',
        'Fasilitas Makan Shift Kerja',
        'Perlengkapan Higienitas & Masker',
        'Tablet Kasir POS & Printer Struk',
        'Tunjangan Transportasi Shift Malam',
      ],
      defaultSkills: [
        'Barista & Brewing Manual',
        'Hospitality Service & Waiter',
        'Kasir POS & Pembukuan Kas Harian',
        'Cook / Juru Masak Catering Lapangan',
        'Housekeeping & Kebersihan Mess',
      ],
    },
    HEALTH_MEDIS: {
      label: 'Kesehatan & Medis Lapangan',
      defaultEducation: 'D3',
      tools: [
        'Tas Tanggap Darurat Trauma Kit (First Aid Bag)',
        'Seragam Medis & APD Proteksi Infeksi (N95 / Gloves)',
        'Tensimeter & Oximeter Digital',
        'Automated External Defibrillator (AED) Akses',
        'Radio Komunikasi Siaga Ambulans',
      ],
      defaultSkills: [
        'Perawat Medis Lapangan (Site Nurse)',
        'Dokter Okupasi / Tambang (Hiperkes)',
        'Paramedis Ambulans Darurat',
        'Analis Laboratorium Medis',
        'Apoteker / Pengelola Obat Klinik',
      ],
    },
    GENERAL_PRO: {
      label: 'Umum & Profesional Kantor',
      defaultEducation: 'SMA',
      tools: [
        'Komputer Kerja / Laptop Kantor',
        'Perlengkapan ATK & Meja Kerja Dedikasi',
        'Tunjangan Komunikasi / Pulsa Kerja',
        'Kartu Identitas Karyawan & Akses Gedung',
        'Akses Software & Sistem Informasi Kantor',
      ],
      defaultSkills: [
        'Komunikasi Bisnis & Negosiasi',
        'Manajemen Waktu & Problem Solving',
        'Administrasi Dokumen & Arsip',
        'Pengoperasian Komputer (Word/Excel)',
      ],
    },
    KONSTRUKSI_SIPIL: {
      label: 'Konstruksi, Bangunan & Pekerjaan Sipil',
      defaultEducation: 'SMA',
      tools: [
        'Helm Safety Proyek Lapangan (SNI)',
        'Sepatu Safety Steel Toe Konstruksi',
        'Rompi Safety Visibilitas Tinggi Proyek',
        'Sarung Tangan Kerja Tahan Gesekan',
        'Kacamata Pelindung Debu & Serpihan',
        'Perlengkapan Alat Pertukangan Manual',
      ],
      defaultSkills: [
        'Pekerjaan Adukan Semen & Pengecoran',
        'Pemasangan Batu Bata, Batako & Hebel',
        'Pekerjaan Pondasi & Galian Tanah',
        'Plesteran Dinding & Acian Halus',
        'K3 Konstruksi & Pekerjaan Sipil',
        'Pemasangan Bekisting & Pembesian',
      ],
    },
    KEAMANAN_SECURITY: {
      label: 'Keamanan, Pengamanan & Satpam',
      defaultEducation: 'SMA',
      tools: [
        'Seragam PDH / PDL Satpam Lengkap',
        'Sepatu Boots Safety Lapangan',
        'Tongkat T & Rompi Reflektif Malam',
        'Radio Komunikasi Handy Talkie (HT)',
        'Buku Mutasi & Jurnal Patroli Keamanan',
      ],
      defaultSkills: [
        'Gada Pratama / Gada Madya Bersertifikat',
        'Patroli Area & Pengawasan Akses Masuk',
        'Pengendalian Situasi Darurat & K3',
        'Pengoperasian CCTV & Pemantauan Monitor',
        'Pemeriksaan Kendaraan & Manajemen Tamu',
      ],
    },
  };

  // Keyword Matching Matrix untuk Klasifikasi Cepat (< 5ms)
  private readonly KEYWORD_PATTERNS: Array<{ regex: RegExp; category: string }> = [
    { regex: /dev|frontend|backend|fullstack|software|programmer|it|web|mobile|flutter|react|node|data|cloud|devops|network|cyber|design|figma|qa/i, category: 'DIGITAL_IT' },
    { regex: /excavator|dump truck|dozer|grader|loader|mekanik|alat berat|surveyor|blaster|tambang|mining|ore|crusher|rigger|hauler/i, category: 'TAMBANG_ALAT_BERAT' },
    { regex: /las|welder|welding|smaw|gtaw|argon|fitter|pipa|fabrikasi|baja|scaffolding|bubut|milling/i, category: 'WELDING_FABRIKASI' },
    { regex: /listrik|electric|elektro|panel|plc|scada|instrument|hvac|chiller|ac|power plant|genset/i, category: 'ELEKTRIKAL' },
    { regex: /k3|safety|hse|she|lingkungan|damkar|fire|b3|paramedis|first aid/i, category: 'K3_SAFETY' },
    { regex: /gudang|warehouse|logistik|inventory|forklift|procurement|purchasing|admin|pengiriman/i, category: 'LOGISTIK_ADMIN' },
    { regex: /barista|kopi|coffee|cafe|kafe|waiter|pelayan|cook|masak|chef|catering|hotel|housekeeping|kasir/i, category: 'HOSPITALITY_FNB' },
    { regex: /perawat|nurse|dokter|medis|klinik|apoteker|laboratorium|bidan|farmasi/i, category: 'HEALTH_MEDIS' },
    { regex: /kuli|bangunan|tukang|konstruksi|sipil|mandor|semen|batu|adukan|plester|proyek|pondasi|bekisting|kenek|cat\b/i, category: 'KONSTRUKSI_SIPIL' },
    { regex: /satpam|security|keamanan|guard|patroli|pengawal/i, category: 'KEAMANAN_SECURITY' },
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly openAiService: OpenAiService,
  ) {}

  /**
   * Agen 1: Job Specification & Regulatory Copilot (POLISH_TASKS)
   * Merapikan deskripsi tugas kasar menjadi SOP operasional berstandar K3 Mimika.
   */
  async polishTasks(title: string, rawTasks: string, opportunityType: string = 'JOB'): Promise<AiVacancyAssistResponseDto> {
    const cleanRawTasks = (rawTasks || '').trim();
    if (!cleanRawTasks) {
      return {
        status: 'error',
        action: 'POLISH_TASKS',
        summary: 'Uraian tugas kasar tidak boleh kosong.',
        providerUsed: 'LOCAL_FALLBACK',
      };
    }

    // 1. Coba Panggilan ke OpenAI LLM
    if (this.openAiService.isAvailable()) {
      try {
        const prompt = buildPolishTasksUserPrompt(title, cleanRawTasks, opportunityType);
        const aiResponse = await this.openAiService.generateCompletion(
          VACANCY_COPILOT_SYSTEM_PROMPT,
          prompt,
          { temperature: 0.3, maxTokens: 600 },
        );

        if (aiResponse && aiResponse.length > 20) {
          return {
            status: 'success',
            action: 'POLISH_TASKS',
            polishedTasks: aiResponse,
            summary: 'Uraian tugas berhasil dirapikan dan distandarisasi secara profesional oleh AI.',
            providerUsed: 'OPENAI',
          };
        }
      } catch (err) {
        this.logger.warn(`OpenAI polish tasks failed: ${err}. Falling back to local template.`);
      }
    }

    // 2. Graceful Local Fallback (Tanpa Crash)
    const rawLines = cleanRawTasks
      .split(/\n|\r|\./)
      .map((l) => l.trim())
      .filter((l) => l.length > 5);

    const formattedLines = rawLines.length > 0
      ? rawLines.map((l) => `- ${l.replace(/^[-*•\d.]+\s*/, '')}`)
      : [`- Melaksanakan tanggung jawab utama posisi ${title || 'pekerjaan'} sesuai target yang ditentukan.`];

    formattedLines.push('- Menjaga dan memelihara seluruh sarana kerja yang dipercayakan oleh perusahaan.');
    
    // Hanya cantumkan K3/APD jika posisi adalah pekerjaan fisik/lapangan
    const isFieldRole = /tambang|las|welder|alat berat|operator|konstruksi|sipil|kuli|bangunan|mekanik|listrik|gardu|pabrik|lapangan/i.test(title || '');
    if (isFieldRole) {
      formattedLines.push('- Wajib mematuhi prosedur keselamatan kerja (K3) dan menggunakan APD yang dipersyaratkan di lokasi kerja.');
    } else {
      formattedLines.push('- Menjunjung tinggi etika profesional, ketelitian data, dan integritas kerja sesuai kebijakan perusahaan.');
    }

    return {
      status: 'success',
      action: 'POLISH_TASKS',
      polishedTasks: formattedLines.join('\n'),
      summary: 'Uraian tugas dirapikan menggunakan format profesional standar (Fallback Mode).',
      providerUsed: 'LOCAL_FALLBACK',
    };
  }

  /**
   * Agen 1: Suggest Criteria with AI
   */
  async suggestCriteriaWithAi(
    title: string,
    rawTasks?: string,
    opportunityType: string = 'JOB',
  ): Promise<AiVacancyAssistResponseDto> {
    // 1. Coba OpenAI jika tersedia
    if (this.openAiService.isAvailable() && title?.trim()) {
      try {
        const prompt = buildSuggestCriteriaUserPrompt(title, rawTasks, opportunityType);
        const aiResponse = await this.openAiService.generateCompletion(
          VACANCY_COPILOT_SYSTEM_PROMPT,
          prompt,
          { temperature: 0.2, maxTokens: 500, jsonMode: true },
        );

        if (aiResponse) {
          const parsed = JSON.parse(aiResponse);
          if (Array.isArray(parsed.suggestedSkills) && parsed.suggestedSkills.length > 0) {
            return {
              status: 'success',
              action: 'SUGGEST_CRITERIA',
              suggestedSkills: parsed.suggestedSkills,
              suggestedTools: Array.isArray(parsed.suggestedTools) ? parsed.suggestedTools : [],
              categoryLabel: parsed.categoryLabel || 'Industri & Operasional',
              summary: parsed.summary || 'Kriteria dianalisis oleh AI Copilot.',
              providerUsed: 'OPENAI',
            };
          }
        }
      } catch (err) {
        this.logger.warn(`OpenAI suggest criteria failed: ${err}. Falling back to local dictionary.`);
      }
    }

    // 2. Fallback Lokal
    const local = await this.getLocalSuggestions(title || '');
    return {
      status: 'success',
      action: 'SUGGEST_CRITERIA',
      suggestedSkills: local.recommendedSkills,
      suggestedTools: local.recommendedTools,
      categoryLabel: local.categoryLabel,
      summary: 'Saran kriteria diidentifikasi dari taksonomi industri lokal Mimika.',
      providerUsed: 'LOCAL_FALLBACK',
    };
  }

  async getSuggestions(title: string): Promise<VacancySuggestionDto> {
    const sanitizedTitle = (title || '').trim().toLowerCase();

    if (!sanitizedTitle) {
      return this.getLocalSuggestions('');
    }

    // 1. Panggil OpenAI Copilot secara cerdas jika API tersedia (Agent 1)
    if (this.openAiService.isAvailable() && sanitizedTitle.length >= 3) {
      try {
        const prompt = buildSuggestCriteriaUserPrompt(title, undefined, 'JOB');
        const aiResponse = await this.openAiService.generateCompletion(
          VACANCY_COPILOT_SYSTEM_PROMPT,
          prompt,
          { temperature: 0.2, maxTokens: 500, jsonMode: true },
        );

        if (aiResponse) {
          const parsed = JSON.parse(aiResponse);
          if (Array.isArray(parsed.suggestedSkills) && parsed.suggestedSkills.length > 0) {
            return {
              inferredCategory: parsed.categoryLabel?.toUpperCase().replace(/[^A-Z0-9]+/g, '_') || 'AI_SUGGESTED',
              categoryLabel: parsed.categoryLabel || 'Analisis Cerdas AI',
              recommendedSkills: parsed.suggestedSkills,
              recommendedTools: Array.isArray(parsed.suggestedTools) ? parsed.suggestedTools : [],
              suggestedEducation: 'SMK / SMA Sederajat',
            };
          }
        }
      } catch (err) {
        this.logger.warn(`OpenAI dynamic suggestion failed: ${err}. Falling back to local dictionary.`);
      }
    }

    // 2. Fallback ke Kamus Taksonomi Lokal Cepat
    return this.getLocalSuggestions(title);
  }

  async getLocalSuggestions(title: string): Promise<VacancySuggestionDto> {
    const sanitizedTitle = (title || '').trim().toLowerCase();

    if (!sanitizedTitle) {
      const def = this.CATEGORY_TOOLS.GENERAL_PRO;
      return {
        inferredCategory: 'GENERAL_PRO',
        categoryLabel: def.label,
        recommendedSkills: def.defaultSkills,
        recommendedTools: def.tools,
        suggestedEducation: def.defaultEducation,
      };
    }

    // 1. Deteksi Cepat Menggunakan Pola Kata Kunci Regex (< 1ms)
    let matchedCategory = 'GENERAL_PRO';
    for (const pattern of this.KEYWORD_PATTERNS) {
      if (pattern.regex.test(sanitizedTitle)) {
        matchedCategory = pattern.category;
        break;
      }
    }

    // 2. Jika Masih General, Coba Cari di Tabel master_skills
    if (matchedCategory === 'GENERAL_PRO') {
      try {
        const words = sanitizedTitle.split(/\s+/).filter((w) => w.length > 2);
        if (words.length > 0) {
          const dbSkill = await this.prisma.masterSkill.findFirst({
            where: {
              OR: words.map((w) => ({
                name: { contains: w, mode: 'insensitive' },
              })),
            },
            select: { category: true },
          });

          if (dbSkill?.category && this.CATEGORY_TOOLS[dbSkill.category]) {
            matchedCategory = dbSkill.category;
          }
        }
      } catch (err) {
        this.logger.warn(`Fallback regex used due to DB skill lookup error: ${err}`);
      }
    }

    const config = this.CATEGORY_TOOLS[matchedCategory] || this.CATEGORY_TOOLS.GENERAL_PRO;

    // 3. Ambil Skill Tambahan dari DB jika ada
    let skills = [...config.defaultSkills];
    try {
      const dbSkills = await this.prisma.masterSkill.findMany({
        where: { category: matchedCategory },
        take: 6,
        select: { name: true },
      });
      if (dbSkills.length > 0) {
        const names = dbSkills.map((s) => s.name);
        skills = Array.from(new Set([...names, ...skills])).slice(0, 8);
      }
    } catch {
      // Gunakan defaultSkills statis jika query gagal
    }

    return {
      inferredCategory: matchedCategory,
      categoryLabel: config.label,
      recommendedSkills: skills,
      recommendedTools: config.tools,
      suggestedEducation: config.defaultEducation,
    };
  }
}
