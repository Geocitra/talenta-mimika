import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { InstitutionService } from './institution.service';
import { InstitutionCategory, Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('api/v1/institutions')
export class InstitutionController {
  constructor(private readonly institutionService: InstitutionService) {}

  // ============================================================
  // 1. ENDPOINT PUBLIK / TALENTA: AUTOCOMPLETE SEARCH
  // ============================================================
  @Get('search')
  async search(
    @Query('q') q: string,
    @Query('category') category?: InstitutionCategory,
  ) {
    return this.institutionService.searchInstitutions(q, category);
  }

  // ============================================================
  // 1B. ENDPOINT ADMIN / SUPERADMIN: LIST INSTITUSI BERPAGINASI
  // ============================================================
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DISNAKER_ADMIN, Role.SUPERADMIN)
  async getAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('q') q?: string,
    @Query('category') category?: InstitutionCategory,
  ) {
    return this.institutionService.getAllInstitutions({ page, limit, q, category });
  }

  // ============================================================
  // 2. ENDPOINT ADMIN DISNAKER & SUPERADMIN: MANUAL SYNC KAMPUS
  // ============================================================
  @Post('sync/kampus')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DISNAKER_ADMIN, Role.SUPERADMIN)
  async syncKampus() {
    return this.institutionService.syncAllKampus();
  }

  // ============================================================
  // 3. ENDPOINT ADMIN DISNAKER & SUPERADMIN: MANUAL SYNC SEKOLAH KABUPATEN
  // ============================================================
  @Post('sync/sekolah')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DISNAKER_ADMIN, Role.SUPERADMIN)
  async syncSekolah(
    @Query('kabupaten_id') kabupatenId: string,
    @Query('jenis') jenis: 'SMA' | 'SMK',
  ) {
    return this.institutionService.syncSchoolsByRegency(
      kabupatenId || '9104',
      jenis || 'SMK',
    );
  }

  // ============================================================
  // 4. ENDPOINT ADMIN DISNAKER & SUPERADMIN: SYNC SEKOLAH BY KEYWORD
  // ============================================================
  @Post('sync/sekolah/search')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DISNAKER_ADMIN, Role.SUPERADMIN)
  async syncSekolahSearch(@Query('q') q: string) {
    return this.institutionService.syncSchoolsBySearch(q);
  }

  // ============================================================
  // 5. ENDPOINT ADMIN DISNAKER & SUPERADMIN: SYNC KAMPUS BY KEYWORD
  // ============================================================
  @Post('sync/kampus/search')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DISNAKER_ADMIN, Role.SUPERADMIN)
  async syncKampusSearch(@Query('q') q: string) {
    return this.institutionService.syncKampusBySearch(q);
  }

  // ============================================================
  // 6. DETAIL SEKOLAH & KAMPUS LANGSUNG
  // ============================================================
  @Get('sekolah-detail')
  async getSchoolDetail(@Query('npsn') npsn: string) {
    return this.institutionService.fetchSchoolDetail(npsn);
  }

  @Get('kampus-detail')
  async getKampusDetail(@Query('id') id: string) {
    return this.institutionService.fetchKampusDetail(id);
  }
}
