import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { VacancyService } from './vacancy.service';
import { VacancyAssistantService } from './vacancy-assistant.service';
import { CreateJobVacancyDto } from './dto/create-job-vacancy.dto';
import { UpdateJobVacancyDto } from './dto/update-job-vacancy.dto';
import { ResolveVacancyOutcomeDto } from './dto/resolve-vacancy-outcome.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('api/v1/vacancies')
export class VacancyController {
  constructor(
    private readonly vacancyService: VacancyService,
    private readonly assistantService: VacancyAssistantService,
  ) {}

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

  @Get('pending-outcomes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EMPLOYER)
  async getPendingOutcomes(@Req() req: any) {
    return this.vacancyService.getPendingOutcomes(req.user.id);
  }

  @Patch(':id/resolve-outcome')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EMPLOYER)
  async resolveOutcome(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
    @Body() dto: ResolveVacancyOutcomeDto,
  ) {
    return this.vacancyService.resolveOutcome(id, req.user.id, dto);
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

  // ==================== ASISTEN CERDAS (AI CONTEXTUAL SUGGESTIONS & COPILOT) ====================
  @Get('suggestions')
  async getSuggestions(@Query('title') title?: string) {
    const data = await this.assistantService.getSuggestions(title || '');
    return {
      status: 'success',
      data,
    };
  }

  @Post('ai-assist')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EMPLOYER, Role.SUPERADMIN, Role.DISNAKER_ADMIN)
  async aiAssist(
    @Body() body: { action: 'POLISH_TASKS' | 'SUGGEST_CRITERIA'; title?: string; rawTasks?: string; opportunityType?: any },
  ) {
    if (body.action === 'POLISH_TASKS') {
      const result = await this.assistantService.polishTasks(
        body.title || '',
        body.rawTasks || '',
        body.opportunityType || 'JOB',
      );
      return {
        status: 'success',
        data: result,
      };
    }

    const result = await this.assistantService.suggestCriteriaWithAi(
      body.title || '',
      body.rawTasks || '',
      body.opportunityType || 'JOB',
    );
    return {
      status: 'success',
      data: result,
    };
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
