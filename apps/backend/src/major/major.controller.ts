import {
  Body,
  Controller,
  Get,
  Param,
  Post,
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
  // 3. ENDPOINT ADMIN DISNAKER: DAFTAR KARANTINA JURUSAN BARU
  // ============================================================
  @Get('curation')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DISNAKER_ADMIN)
  async getCurationList() {
    return this.majorService.getCurationList();
  }

  // ============================================================
  // 4. ENDPOINT ADMIN DISNAKER: 1-CLICK AI APPROVAL KE MASTER
  // ============================================================
  @Post('curation/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DISNAKER_ADMIN)
  async approveSuggestion(
    @Param('id') id: string,
    @Body('approvedName') approvedName?: string,
    @Body('category') category?: string,
  ) {
    return this.majorService.approveSuggestion(id, approvedName, category);
  }

  // ============================================================
  // 5. ENDPOINT ADMIN DISNAKER: TOLAK USULAN
  // ============================================================
  @Post('curation/:id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DISNAKER_ADMIN)
  async rejectSuggestion(@Param('id') id: string) {
    return this.majorService.rejectSuggestion(id);
  }
}
