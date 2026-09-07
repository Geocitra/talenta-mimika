import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { InstitutionCategory } from '@prisma/client';

@Injectable()
export class InstitutionService {
  private readonly logger = new Logger(InstitutionService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('API_INDONESIA_KEY', '');
    this.baseUrl = this.configService.get<string>(
      'API_INDONESIA_BASE_URL',
      'https://use.apiindonesia.id/api/v1',
    );
  }

  // ============================================================
  // 1. PENCARIAN AUTOCOMPLETE CEPAT (DIGUNAKAN OLEH FRONTEND)
  // ============================================================
  async searchInstitutions(query: string, category?: InstitutionCategory) {
    if (!query || query.trim().length < 2) {
      return { status: 'success', total: 0, data: [] };
    }

    const trimmed = query.trim();
    const institutions = await this.prisma.masterInstitution.findMany({
      where: {
        category: category ? category : undefined,
        OR: [
          { name: { contains: trimmed, mode: 'insensitive' } },
          { shortName: { contains: trimmed, mode: 'insensitive' } },
        ],
      },
      take: 15, // 15 hasil teratas untuk respons kilat
      orderBy: { name: 'asc' },
    });

    return {
      status: 'success',
      total: institutions.length,
      data: institutions,
    };
  }

  // ============================================================
  // 1B. DAFTAR SELURUH INSTITUSI RESMI DENGAN PAGINATION
  // ============================================================
  async getAllInstitutions(params: {
    page?: number;
    limit?: number;
    q?: string;
    category?: InstitutionCategory;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(params.limit) || 10));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.q && params.q.trim().length > 0) {
      const trimmed = params.q.trim();
      where.OR = [
        { name: { contains: trimmed, mode: 'insensitive' } },
        { shortName: { contains: trimmed, mode: 'insensitive' } },
        { externalId: { contains: trimmed, mode: 'insensitive' } },
        { regencyName: { contains: trimmed, mode: 'insensitive' } },
        { provinceName: { contains: trimmed, mode: 'insensitive' } },
      ];
    }
    if (params.category) {
      where.category = params.category;
    }

    const [data, total] = await Promise.all([
      this.prisma.masterInstitution.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ provinceName: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.masterInstitution.count({ where }),
    ]);

    return {
      status: 'success',
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  // ============================================================
  // 2. WORKER SINKRONISASI MASSAL KAMPUS (DENGAN PACING & RETRY)
  // ============================================================
  async syncAllKampus(): Promise<{ status: string; syncedCount: number }> {
    this.logger.log('Memulai sinkronisasi seluruh kampus se-Indonesia dari API Indonesia...');
    let page = 1;
    let totalPages = 1;
    let totalSynced = 0;

    while (page <= totalPages) {
      this.logger.log(`Mengambil data kampus halaman ${page} dari ${totalPages}...`);
      const url = page === 1 ? `${this.baseUrl}/kampus` : `${this.baseUrl}/kampus?page=${page}`;

      let success = false;
      let json: any = null;

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const res = await fetch(url, {
            headers: {
              'X-API-KEY': this.apiKey,
              'x-api-key': this.apiKey,
              'User-Agent': 'MimikaTalenta-Backend/1.0',
            },
          });

          if (res.ok) {
            json = await res.json();
            success = true;
            break;
          }

          this.logger.warn(`Percobaan ${attempt} gagal: HTTP ${res.status}`);
        } catch (err: any) {
          this.logger.warn(`Percobaan ${attempt} error: ${err.message}`);
        }
        await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
      }

      if (!success || !json?.data) {
        this.logger.warn(`Gagal mengambil data kampus halaman ${page} setelah 3 percobaan. Mengakhiri batch saat ini.`);
        break;
      }

      totalPages = json.meta?.total_pages || 1;
      const items = json.data || [];

      // Upsert massal ke PostgreSQL
      for (const item of items) {
        await this.prisma.masterInstitution.upsert({
          where: { externalId: String(item.id) },
          update: {
            name: item.name.trim(),
            shortName: item.short_name?.trim() || null,
            category: InstitutionCategory.KAMPUS,
            status: item.kelompok || null,
            provinceName: item.province_name || null,
            regencyName: item.regency_name || null,
          },
          create: {
            externalId: String(item.id),
            name: item.name.trim(),
            shortName: item.short_name?.trim() || null,
            category: InstitutionCategory.KAMPUS,
            status: item.kelompok || null,
            provinceName: item.province_name || null,
            regencyName: item.regency_name || null,
          },
        });
        totalSynced++;
      }

      page++;
      // Delay 1.5 detik antar request untuk menghormati rate limit
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    this.logger.log(`Sinkronisasi selesai! Berhasil menyimpan ${totalSynced} kampus ke database lokal.`);
    return { status: 'success', syncedCount: totalSynced };
  }

  // ============================================================
  // 3. SINKRONISASI SEKOLAH (FOKUS KABUPATEN MIMIKA & PAPUA TENGAH)
  // ============================================================
  async syncSchoolsByRegency(kabupatenId: string, jenis: 'SMA' | 'SMK') {
    this.logger.log(`Mengambil data ${jenis} untuk kabupaten/kota ID ${kabupatenId}...`);
    const url = `${this.baseUrl}/sekolah?kabupaten_id=${kabupatenId}&jenis=${jenis}`;

    try {
      const res = await fetch(url, {
        headers: {
          'X-API-KEY': this.apiKey,
          'x-api-key': this.apiKey,
          'User-Agent': 'MimikaTalenta-Backend/1.0',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
      }
      const json = await res.json();
      const items = json.data || [];
      let count = 0;

      for (const item of items) {
        const externalId = item.npsn ? String(item.npsn) : String(item.id);
        await this.prisma.masterInstitution.upsert({
          where: { externalId },
          update: {
            name: item.name.trim(),
            category: jenis === 'SMA' ? InstitutionCategory.SMA : InstitutionCategory.SMK,
            status: item.status || null,
          },
          create: {
            externalId,
            name: item.name.trim(),
            category: jenis === 'SMA' ? InstitutionCategory.SMA : InstitutionCategory.SMK,
            status: item.status || null,
            provinceName: item.province_name || 'PAPUA TENGAH',
            regencyName: item.regency_name || 'KABUPATEN MIMIKA',
          },
        });
        count++;
      }

      return { status: 'success', syncedCount: count };
    } catch (err: any) {
      this.logger.error(`Gagal sinkronisasi sekolah: ${err.message}`);
      return { status: 'error', message: err.message };
    }
  }

  // ============================================================
  // 4. SINKRONISASI SEKOLAH VIA PENCARIAN KATA KUNCI (DAERAH MIMIKA / TIMIKA)
  // Endpoint: GET /api/v1/sekolah/search?q=...
  // ============================================================
  async syncSchoolsBySearch(keyword: string) {
    if (!keyword || keyword.trim().length < 3) {
      return { status: 'error', message: 'Keyword minimal 3 karakter' };
    }

    const trimmed = keyword.trim();
    this.logger.log(`Sinkronisasi sekolah dengan kata kunci: "${trimmed}"...`);
    const url = `${this.baseUrl}/sekolah/search?q=${encodeURIComponent(trimmed)}`;

    try {
      const res = await fetch(url, {
        headers: {
          'X-API-KEY': this.apiKey,
          'x-api-key': this.apiKey,
          'User-Agent': 'MimikaTalenta-Backend/1.0',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      const items = json.data || [];
      let count = 0;

      for (const item of items) {
        // Fokuskan pada angkatan kerja produktif: SMA & SMK
        if (item.jenis !== 'SMA' && item.jenis !== 'SMK') continue;

        const category = item.jenis === 'SMA' ? InstitutionCategory.SMA : InstitutionCategory.SMK;
        const externalId = item.npsn ? `sch-${item.npsn}` : `sch-${item.name}`;

        await this.prisma.masterInstitution.upsert({
          where: { externalId },
          update: {
            name: item.name.trim(),
            category,
            status: item.status || null,
            provinceName: item.province_name || null,
            regencyName: item.regency_name || null,
          },
          create: {
            externalId,
            name: item.name.trim(),
            category,
            status: item.status || null,
            provinceName: item.province_name || null,
            regencyName: item.regency_name || null,
          },
        });
        count++;
      }

      this.logger.log(`Berhasil menyimpan ${count} sekolah dari pencarian "${trimmed}".`);
      return { status: 'success', keyword: trimmed, syncedCount: count };
    } catch (err: any) {
      this.logger.error(`Gagal sinkronisasi sekolah kata kunci "${trimmed}": ${err.message}`);
      return { status: 'error', message: err.message };
    }
  }

  // ============================================================
  // 5. SINKRONISASI KAMPUS VIA PENCARIAN KATA KUNCI (PAPUA, DLL)
  // Endpoint: GET /api/v1/kampus/search?q=...
  // ============================================================
  async syncKampusBySearch(keyword: string) {
    if (!keyword || keyword.trim().length < 2) {
      return { status: 'error', message: 'Keyword minimal 2 karakter' };
    }

    const trimmed = keyword.trim();
    this.logger.log(`Sinkronisasi kampus dengan kata kunci: "${trimmed}"...`);
    const url = `${this.baseUrl}/kampus/search?q=${encodeURIComponent(trimmed)}`;

    try {
      const res = await fetch(url, {
        headers: {
          'X-API-KEY': this.apiKey,
          'x-api-key': this.apiKey,
          'User-Agent': 'MimikaTalenta-Backend/1.0',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      const items = json.data || [];
      let count = 0;

      for (const item of items) {
        const externalId = String(item.id);
        await this.prisma.masterInstitution.upsert({
          where: { externalId },
          update: {
            name: item.name.trim(),
            shortName: item.short_name?.trim() || null,
            category: InstitutionCategory.KAMPUS,
            status: item.kelompok || null,
            provinceName: item.province_name || null,
            regencyName: item.regency_name || null,
          },
          create: {
            externalId,
            name: item.name.trim(),
            shortName: item.short_name?.trim() || null,
            category: InstitutionCategory.KAMPUS,
            status: item.kelompok || null,
            provinceName: item.province_name || null,
            regencyName: item.regency_name || null,
          },
        });
        count++;
      }

      this.logger.log(`Berhasil menyimpan ${count} kampus dari pencarian "${trimmed}".`);
      return { status: 'success', keyword: trimmed, syncedCount: count };
    } catch (err: any) {
      this.logger.error(`Gagal sinkronisasi kampus kata kunci "${trimmed}": ${err.message}`);
      return { status: 'error', message: err.message };
    }
  }

  // ============================================================
  // 6. DETAIL SEKOLAH BY NPSN (GET /api/v1/sekolah/:npsn)
  // ============================================================
  async fetchSchoolDetail(npsn: string) {
    const url = `${this.baseUrl}/sekolah/${npsn}`;
    try {
      const res = await fetch(url, {
        headers: {
          'X-API-KEY': this.apiKey,
          'x-api-key': this.apiKey,
          'User-Agent': 'MimikaTalenta-Backend/1.0',
        },
      });
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      return await res.json();
    } catch (err: any) {
      return { status: 'error', message: err.message };
    }
  }

  // ============================================================
  // 7. DETAIL KAMPUS BY ID (GET /api/v1/kampus/:id)
  // ============================================================
  async fetchKampusDetail(id: string) {
    const url = `${this.baseUrl}/kampus/${id}`;
    try {
      const res = await fetch(url, {
        headers: {
          'X-API-KEY': this.apiKey,
          'x-api-key': this.apiKey,
          'User-Agent': 'MimikaTalenta-Backend/1.0',
        },
      });
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      return await res.json();
    } catch (err: any) {
      return { status: 'error', message: err.message };
    }
  }
}

