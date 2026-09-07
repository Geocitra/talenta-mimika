import {
  Controller,
  Get,
  Post,
  Param,
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
}

