import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MatchingEngineService } from './matching-engine.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('api/v1/vacancies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MatchingController {
  constructor(private readonly matchingService: MatchingEngineService) {}

  // Endpoint: Melihat daftar peringkat talenta yang direkomendasikan untuk lowongan tertentu
  @Get(':id/candidates')
  @Roles(Role.EMPLOYER)
  async getRankedCandidates(
    @Param('id', ParseUUIDPipe) vacancyId: string,
    @Req() req: any,
  ) {
    return this.matchingService.getRankedCandidatesForVacancy(vacancyId, req.user.id);
  }

  // Endpoint: Mengeksekusi pendekatan resmi terhadap talenta yang diminati
  @Post(':id/approach/:talentId')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.EMPLOYER)
  async approachTalent(
    @Param('id', ParseUUIDPipe) vacancyId: string,
    @Param('talentId', ParseUUIDPipe) talentId: string,
    @Req() req: any,
  ) {
    return this.matchingService.approachTalent(vacancyId, talentId, req.user.id);
  }

  // Endpoint: Memilih talenta ke daftar terpilih (Staging rekrutmen tanpa kunci)
  @Post(':id/select/:talentId')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.EMPLOYER)
  async selectTalent(
    @Param('id', ParseUUIDPipe) vacancyId: string,
    @Param('talentId', ParseUUIDPipe) talentId: string,
    @Req() req: any,
  ) {
    return this.matchingService.selectTalent(vacancyId, talentId, req.user.id);
  }

  // Endpoint: Membatalkan pilihan talenta (Kembalikan ke rekomendasi)
  @Post(':id/unselect/:talentId')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.EMPLOYER)
  async unselectTalent(
    @Param('id', ParseUUIDPipe) vacancyId: string,
    @Param('talentId', ParseUUIDPipe) talentId: string,
    @Req() req: any,
  ) {
    return this.matchingService.unselectTalent(vacancyId, talentId, req.user.id);
  }

  // Endpoint: Selesaikan Rekrutmen secara sadar & Kunci Kontrak Seluruh Talenta Terpilih
  @Post(':id/finalize-recruitment')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.EMPLOYER)
  async finalizeRecruitment(
    @Param('id', ParseUUIDPipe) vacancyId: string,
    @Req() req: any,
  ) {
    return this.matchingService.finalizeRecruitment(vacancyId, req.user.id);
  }

  // Endpoint: Merekrut resmi talenta (Single Active Contract Lock & Kuota Update)
  @Post(':id/hire/:talentId')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.EMPLOYER)
  async hireTalent(
    @Param('id', ParseUUIDPipe) vacancyId: string,
    @Param('talentId', ParseUUIDPipe) talentId: string,
    @Req() req: any,
  ) {
    return this.matchingService.hireTalent(vacancyId, talentId, req.user.id);
  }

  // Endpoint: Membatalkan perekrutan talenta (kuota terbuka kembali & talenta bebas)
  @Post(':id/unhire/:talentId')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.EMPLOYER)
  async unhireTalent(
    @Param('id', ParseUUIDPipe) vacancyId: string,
    @Param('talentId', ParseUUIDPipe) talentId: string,
    @Req() req: any,
  ) {
    return this.matchingService.unhireTalent(vacancyId, talentId, req.user.id);
  }

  // Endpoint: Menandai kandidat tidak sesuai setelah wawancara (Talenta tetap bebas)
  @Post(':id/reject/:talentId')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.EMPLOYER)
  async rejectTalent(
    @Param('id', ParseUUIDPipe) vacancyId: string,
    @Param('talentId', ParseUUIDPipe) talentId: string,
    @Req() req: any,
  ) {
    return this.matchingService.rejectTalent(vacancyId, talentId, req.user.id);
  }

  // Endpoint: Mengembalikan kandidat yang dilewati ke daftar rekomendasi
  @Post(':id/restore-rejected/:talentId')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.EMPLOYER)
  async restoreRejectedTalent(
    @Param('id', ParseUUIDPipe) vacancyId: string,
    @Param('talentId', ParseUUIDPipe) talentId: string,
    @Req() req: any,
  ) {
    return this.matchingService.restoreRejectedTalent(vacancyId, talentId, req.user.id);
  }

  // Endpoint: Duplikasi Lowongan Pekerjaan (Buka Batch Baru - Clean Slate)
  @Post(':id/duplicate')
  @HttpCode(HttpStatus.CREATED)
  @Roles(Role.EMPLOYER)
  async duplicateVacancy(
    @Param('id', ParseUUIDPipe) vacancyId: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.matchingService.duplicateVacancy(vacancyId, req.user.id, body);
  }

  // Endpoint: Talenta memantau seluruh penjajakan & tawaran kerja yang masuk
  @Get('inbound/talent-approaches')
  @Roles(Role.TALENT)
  async getMyInboundApproaches(@Req() req: any) {
    return this.matchingService.getTalentApproaches(req.user.id);
  }
}

