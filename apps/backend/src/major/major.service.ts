import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TextSanitizer } from '../common/utils/text-sanitizer.util';
import { NormalizeMajorResultDto } from '@mimika-talenta/shared-types';

@Injectable()
export class MajorService {
  private readonly logger = new Logger(MajorService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================================
  // 1. PENCARIAN AUTOCOMPLETE CEPAT (UNTUK COMBOBOX FRONTEND)
  // ============================================================
  async searchMajors(query?: string) {
    if (!query || query.trim().length < 2) {
      // Kembalikan 15 jurusan terpopuler
      const defaults = await this.prisma.masterMajor.findMany({
        take: 15,
        orderBy: { name: 'asc' },
      });
      return { status: 'success', total: defaults.length, data: defaults };
    }

    const trimmed = query.trim();
    const results = await this.prisma.masterMajor.findMany({
      where: {
        name: { contains: trimmed, mode: 'insensitive' },
      },
      take: 15,
      orderBy: { name: 'asc' },
    });

    return {
      status: 'success',
      total: results.length,
      data: results,
    };
  }

  // ============================================================
  // 2. NORMALISASI AI & PENDETEKSI TYPO (SELF-HEALING ENGINE)
  // ============================================================
  async normalizeAndSuggest(rawInput: string): Promise<NormalizeMajorResultDto> {
    if (!rawInput || rawInput.trim().length === 0) {
      return {
        originalInput: rawInput,
        sanitizedInput: '',
        hasCorrection: false,
        confidence: 0,
      };
    }

    // 1. Sanitasi teks liar: hapus awalan "s1/d3", akhiran "ugm/ui", dsb.
    const sanitized = TextSanitizer.sanitizeMajorInput(rawInput);

    // 2. Ambil seluruh taksonomi master untuk pencocokan semantik
    const allMasters = await this.prisma.masterMajor.findMany();

    // 3. Cek exact match case-insensitive
    const exactMatch = allMasters.find(
      (m) => m.name.toLowerCase() === sanitized.toLowerCase(),
    );

    if (exactMatch) {
      return {
        originalInput: rawInput,
        sanitizedInput: sanitized,
        suggestedCanonical: exactMatch.name,
        category: exactMatch.category,
        hasCorrection: rawInput.trim() !== exactMatch.name,
        confidence: 1.0,
      };
    }

    // 4. Hitung skor kemiripan (Trigram + Levenshtein) terhadap seluruh master
    let bestMatch: (typeof allMasters)[0] | null = null;
    let bestScore = 0;

    for (const master of allMasters) {
      const score = TextSanitizer.computeSimilarity(sanitized, master.name);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = master;
      }
    }

    // 5. Ambang Batas Koreksi Cerdas (Threshold: 0.68)
    if (bestMatch && bestScore >= 0.68) {
      return {
        originalInput: rawInput,
        sanitizedInput: sanitized,
        suggestedCanonical: bestMatch.name,
        category: bestMatch.category,
        hasCorrection: true,
        confidence: parseFloat(bestScore.toFixed(2)),
      };
    }

    // 6. Jika tidak cocok (jurusan baru): Masukkan ke Meja Karantina
    await this.recordSuggestion(rawInput, sanitized);

    return {
      originalInput: rawInput,
      sanitizedInput: sanitized,
      hasCorrection: false,
      confidence: 0.5,
    };
  }

  // ============================================================
  // 3. REKAM USULAN JURUSAN KE MEJA KARANTINA
  // ============================================================
  private async recordSuggestion(rawInput: string, sanitized: string) {
    try {
      if (!sanitized || sanitized.length < 3) return;

      const existing = await this.prisma.majorSuggestion.findUnique({
        where: { suggestedName: sanitized },
      });

      if (existing) {
        const samples = Array.isArray(existing.sampleInputs)
          ? (existing.sampleInputs as string[])
          : [];
        if (!samples.includes(rawInput)) {
          samples.push(rawInput);
        }

        await this.prisma.majorSuggestion.update({
          where: { id: existing.id },
          data: {
            inputCount: existing.inputCount + 1,
            sampleInputs: samples.slice(-10), // Simpan maksimal 10 variasi terakhir
          },
        });
      } else {
        await this.prisma.majorSuggestion.create({
          data: {
            suggestedName: sanitized,
            aiNormalizedName: sanitized,
            inferredCategory: 'USULAN_WARGA',
            inputCount: 1,
            status: 'PENDING',
            sampleInputs: [rawInput],
          },
        });
      }
    } catch (err: any) {
      this.logger.warn(`Gagal mencatat usulan karantina: ${err.message}`);
    }
  }

  // ============================================================
  // 4. MEJA KURASI DISNAKER: DAFTAR KARANTINA JURUSAN
  // ============================================================
  async getCurationList() {
    const suggestions = await this.prisma.majorSuggestion.findMany({
      where: { status: 'PENDING' },
      orderBy: { inputCount: 'desc' },
    });

    const totalApproved = await this.prisma.majorSuggestion.count({
      where: { status: 'APPROVED' },
    });

    const totalMasters = await this.prisma.masterMajor.count();

    return {
      status: 'success',
      data: {
        pendingSuggestions: suggestions,
        totalPending: suggestions.length,
        totalApproved,
        totalMasters,
      },
    };
  }

  // ============================================================
  // 5. SETUJUI USULAN KARANTINA KE MASTER (1-CLICK AI APPROVAL)
  // ============================================================
  async approveSuggestion(
    id: string,
    approvedName?: string,
    category?: string,
  ) {
    const suggestion = await this.prisma.majorSuggestion.findUnique({
      where: { id },
    });

    if (!suggestion) {
      throw new NotFoundException('Usulan jurusan tidak ditemukan.');
    }

    const finalName = TextSanitizer.toTitleCase(
      approvedName?.trim() ||
        suggestion.aiNormalizedName ||
        suggestion.suggestedName,
    );
    const finalCategory = category?.trim() || 'TEKNIK_LAINNYA';

    // 1. Masukkan / perbarui di master_majors
    const master = await this.prisma.masterMajor.upsert({
      where: { name: finalName },
      update: { category: finalCategory },
      create: { name: finalName, category: finalCategory },
    });

    // 2. Tandai status karantina menjadi APPROVED
    await this.prisma.majorSuggestion.update({
      where: { id },
      data: {
        status: 'APPROVED',
        aiNormalizedName: finalName,
        inferredCategory: finalCategory,
      },
    });

    this.logger.log(
      `Admin menyetujui jurusan baru: "${finalName}" (${finalCategory})`,
    );

    return {
      status: 'success',
      message: `Jurusan "${finalName}" resmi dimasukkan ke Master Taksonomi Mimika.`,
      data: master,
    };
  }

  // ============================================================
  // 6. TOLAK USULAN KARANTINA
  // ============================================================
  async rejectSuggestion(id: string) {
    const suggestion = await this.prisma.majorSuggestion.findUnique({
      where: { id },
    });

    if (!suggestion) {
      throw new NotFoundException('Usulan jurusan tidak ditemukan.');
    }

    await this.prisma.majorSuggestion.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    return {
      status: 'success',
      message: `Usulan jurusan "${suggestion.suggestedName}" ditolak.`,
    };
  }

  // ============================================================
  // 7. SUPERADMIN: LIST MASTER JURUSAN & PRODI (PAGINATED & FILTERED)
  // ============================================================
  async getAllMasterMajors(
    page?: number,
    limit?: number,
    q?: string,
    category?: string,
  ) {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 15));
    const skip = (pageNum - 1) * limitNum;

    const whereClause: any = {};

    if (q && q.trim().length > 0) {
      whereClause.name = {
        contains: q.trim(),
        mode: 'insensitive',
      };
    }

    if (category && category.trim() !== 'ALL') {
      whereClause.category = category.trim();
    }

    const [majors, total] = await Promise.all([
      this.prisma.masterMajor.findMany({
        where: whereClause,
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
        skip,
        take: limitNum,
      }),
      this.prisma.masterMajor.count({ where: whereClause }),
    ]);

    return {
      status: 'success',
      data: majors,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    };
  }

  // ============================================================
  // 8. SUPERADMIN: TAMBAH MASTER JURUSAN / PRODI BARU
  // ============================================================
  async createMasterMajor(data: { name: string; category: string }) {
    if (!data.name || !data.name.trim()) {
      throw new BadRequestException('Nama jurusan / program studi wajib diisi.');
    }
    if (!data.category || !data.category.trim()) {
      throw new BadRequestException('Kategori rumpun keilmuan wajib dipilih.');
    }

    const formattedName = TextSanitizer.toTitleCase(data.name.trim());
    const category = data.category.trim();

    // Pengecekan duplikasi secara case-insensitive
    const existing = await this.prisma.masterMajor.findFirst({
      where: {
        name: {
          equals: formattedName,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Jurusan / Program Studi "${formattedName}" sudah terdaftar di master data.`,
      );
    }

    const major = await this.prisma.masterMajor.create({
      data: {
        name: formattedName,
        category,
      },
    });

    this.logger.log(
      `Superadmin menambahkan master jurusan: "${major.name}" (${major.category})`,
    );

    return {
      status: 'success',
      message: `Master jurusan "${major.name}" berhasil ditambahkan.`,
      data: major,
    };
  }

  // ============================================================
  // 9. SUPERADMIN: PERBARUI MASTER JURUSAN / PRODI
  // ============================================================
  async updateMasterMajor(
    id: string,
    data: { name?: string; category?: string },
  ) {
    const existing = await this.prisma.masterMajor.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Master jurusan tidak ditemukan.');
    }

    const updateData: any = {};

    if (data.name && data.name.trim()) {
      const formattedName = TextSanitizer.toTitleCase(data.name.trim());

      // Cek apakah nama baru bentrok dengan jurusan lain
      const duplicate = await this.prisma.masterMajor.findFirst({
        where: {
          name: {
            equals: formattedName,
            mode: 'insensitive',
          },
          NOT: { id },
        },
      });

      if (duplicate) {
        throw new ConflictException(
          `Nama jurusan "${formattedName}" sudah digunakan oleh data master lain.`,
        );
      }

      updateData.name = formattedName;
    }

    if (data.category && data.category.trim()) {
      updateData.category = data.category.trim();
    }

    const updated = await this.prisma.masterMajor.update({
      where: { id },
      data: updateData,
    });

    this.logger.log(
      `Superadmin memperbarui master jurusan: "${updated.name}" (${updated.category})`,
    );

    return {
      status: 'success',
      message: `Master jurusan "${updated.name}" berhasil diperbarui.`,
      data: updated,
    };
  }

  // ============================================================
  // 10. SUPERADMIN: HAPUS MASTER JURUSAN / PRODI
  // ============================================================
  async deleteMasterMajor(id: string) {
    const existing = await this.prisma.masterMajor.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Master jurusan tidak ditemukan.');
    }

    await this.prisma.masterMajor.delete({
      where: { id },
    });

    this.logger.log(`Superadmin menghapus master jurusan: "${existing.name}"`);

    return {
      status: 'success',
      message: `Master jurusan "${existing.name}" berhasil dihapus.`,
    };
  }
}
