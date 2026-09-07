import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
  ParseUUIDPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { TrainingService } from './training.service';
import { CreateTrainingProgramDto } from './dto/create-training-program.dto';
import { CreateTrainingSessionDto } from './dto/create-training-session.dto';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { SubmitQuizAnswerDto } from './dto/submit-quiz.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('api/v1/trainings')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  // ==================== KANAL DISNAKER ADMIN ====================
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DISNAKER_ADMIN)
  async createProgram(@Req() req: any, @Body() dto: CreateTrainingProgramDto) {
    return this.trainingService.createProgram(req.user.id, dto);
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DISNAKER_ADMIN)
  async publishProgram(@Param('id', ParseUUIDPipe) id: string) {
    return this.trainingService.publishProgram(id);
  }

  @Post(':id/sessions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DISNAKER_ADMIN)
  async addSession(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateTrainingSessionDto,
  ) {
    return this.trainingService.addSessionToProgram(id, dto);
  }

  @Post(':id/quizzes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DISNAKER_ADMIN)
  async addQuiz(
    @Param('id', ParseUUIDPipe) targetId: string,
    @Body() dto: CreateQuizDto,
  ) {
    const isProgramExam = dto.quizType === 'FINAL_EXAM';
    return this.trainingService.addQuiz(targetId, isProgramExam, dto);
  }

  // ==================== KANAL KATALOG & PENDAFTARAN TALENTA ====================
  @Get('catalog')
  async getCatalog() {
    return this.trainingService.getCatalog();
  }

  @Post(':id/enroll')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TALENT)
  async enroll(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.trainingService.enrollProgram(id, req.user.id);
  }

  @Get('my/enrollments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TALENT)
  async getMyEnrollments(@Req() req: any) {
    return this.trainingService.getMyEnrollments(req.user.id);
  }

  // ==================== KANAL PROGRESSIVE LMS & UJIAN ====================
  @Get(':id/sessions/:order')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TALENT)
  async getSessionContent(
    @Param('id', ParseUUIDPipe) programId: string,
    @Param('order', ParseIntPipe) sessionOrder: number,
    @Req() req: any,
  ) {
    return this.trainingService.getSessionContent(programId, sessionOrder, req.user.id);
  }

  @Post('sessions/:id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TALENT)
  async completeSession(@Param('id', ParseUUIDPipe) sessionId: string, @Req() req: any) {
    return this.trainingService.completeSession(sessionId, req.user.id);
  }

  @Post('quizzes/:id/submit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TALENT)
  async submitQuiz(
    @Param('id', ParseUUIDPipe) quizId: string,
    @Req() req: any,
    @Body() dto: SubmitQuizAnswerDto,
  ) {
    return this.trainingService.submitQuiz(quizId, req.user.id, dto);
  }
}
