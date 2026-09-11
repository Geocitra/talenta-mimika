import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MajorService } from './major.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('api/v1/majors')
export class MajorController {
  constructor(private readonly majorService: MajorService) {}

  // ============================================================
  // 1. ENDPOINT PUBLIK: AUTOCOMPLETE PENCARIAN JURUSAN
  // ============================================================
  @Get('search')
  async search(@Query('q') q?: string) {
    return this.majorService.searchMajors(q);
  }

  // ============================================================
  // 2. ENDPOINT PUBLIK: NORMALISASI AI & PENDETEKSI TYPO REAL-TIME
  // ============================================================
  @Post('normalize')
  async normalize(@Body('rawInput') rawInput: string) {
    return this.majorService.normalizeAndSuggest(rawInput || '');
  }

  // ============================================================
  // 3. ENDPOINT ADMIN / SUPERADMIN: DAFTAR KARANTINA JURUSAN BARU
  // ============================================================
  @Get('curation')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DISNAKER_ADMIN, Role.SUPERADMIN)
  async getCurationList() {
    return this.majorService.getCurationList();
  }

  // ============================================================
  // 4. ENDPOINT ADMIN / SUPERADMIN: 1-CLICK AI APPROVAL KE MASTER
  // ============================================================
  @Post('curation/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DISNAKER_ADMIN, Role.SUPERADMIN)
  async approveSuggestion(
    @Param('id') id: string,
    @Body('approvedName') approvedName?: string,
    @Body('category') category?: string,
  ) {
    return this.majorService.approveSuggestion(id, approvedName, category);
  }

  // ============================================================
  // 5. ENDPOINT ADMIN / SUPERADMIN: TOLAK USULAN
  // ============================================================
  @Post('curation/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DISNAKER_ADMIN, Role.SUPERADMIN)
  async rejectSuggestion(@Param('id') id: string) {
    return this.majorService.rejectSuggestion(id);
  }

  // ============================================================
  // 6. ENDPOINT ADMIN / SUPERADMIN: LIST MASTER JURUSAN & PRODI
  // ============================================================
  @Get('master')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DISNAKER_ADMIN, Role.SUPERADMIN)
  async getAllMasterMajors(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('q') q?: string,
    @Query('category') category?: string,
  ) {
    return this.majorService.getAllMasterMajors(page, limit, q, category);
  }

  // ============================================================
  // 7. ENDPOINT ADMIN / SUPERADMIN: TAMBAH MASTER JURUSAN / PRODI
  // ============================================================
  @Post('master')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DISNAKER_ADMIN, Role.SUPERADMIN)
  async createMasterMajor(
    @Body() body: { name: string; category: string },
  ) {
    return this.majorService.createMasterMajor(body);
  }

  // ============================================================
  // 8. ENDPOINT ADMIN / SUPERADMIN: PERBARUI MASTER JURUSAN / PRODI
  // ============================================================
  @Put('master/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DISNAKER_ADMIN, Role.SUPERADMIN)
  async updateMasterMajor(
    @Param('id') id: string,
    @Body() body: { name?: string; category?: string },
  ) {
    return this.majorService.updateMasterMajor(id, body);
  }

  // ============================================================
  // 9. ENDPOINT ADMIN / SUPERADMIN: HAPUS MASTER JURUSAN / PRODI
  // ============================================================
  @Delete('master/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DISNAKER_ADMIN, Role.SUPERADMIN)
  async deleteMasterMajor(@Param('id') id: string) {
    return this.majorService.deleteMasterMajor(id);
  }
}
