import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { VacancyService } from './vacancy.service';
import { CreateJobVacancyDto } from './dto/create-job-vacancy.dto';
import { UpdateJobVacancyDto } from './dto/update-job-vacancy.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('api/v1/vacancies')
export class VacancyController {
  constructor(private readonly vacancyService: VacancyService) {}

  // ==================== KANAL PERUSAHAAN (AUTH EMPLOYER) ====================
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EMPLOYER)
  async createVacancy(@Req() req: any, @Body() dto: CreateJobVacancyDto) {
    return this.vacancyService.createVacancy(req.user.id, dto);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EMPLOYER)
  async getMyVacancies(@Req() req: any) {
    return this.vacancyService.getMyVacancies(req.user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EMPLOYER)
  async updateVacancy(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
    @Body() dto: UpdateJobVacancyDto,
  ) {
    return this.vacancyService.updateVacancy(id, req.user.id, dto);
  }

  @Patch(':id/close')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EMPLOYER)
  async closeVacancy(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
  ) {
    return this.vacancyService.closeVacancy(id, req.user.id);
  }

  // ==================== KATALOG UMUM (BISA DIAKSES PUBLIK/DISNAKER) ====================
  @Get('open')
  async getAllOpenVacancies() {
    return this.vacancyService.getAllOpenVacancies();
  }

  @Get(':id')
  async getVacancyById(@Param('id', ParseUUIDPipe) id: string) {
    return this.vacancyService.getVacancyById(id);
  }
}
