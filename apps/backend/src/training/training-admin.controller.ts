import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TrainingAdminService } from './training-admin.service';
import { CurateProgramDto } from './dto/curate-program.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, ProgramApprovalStatus, TrainingProgramStatus } from '@prisma/client';

@Controller('api/v1/training-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DISNAKER_ADMIN, Role.SUPERADMIN)
export class TrainingAdminController {
  constructor(private readonly adminService: TrainingAdminService) {}

  @Get('programs/pending')
  async getPendingProgramCurations() {
    return this.adminService.getPendingProgramCurations();
  }

  @Get('programs')
  async getAllPrograms(
    @Query('approvalStatus') approvalStatus?: ProgramApprovalStatus,
    @Query('status') status?: TrainingProgramStatus,
  ) {
    return this.adminService.getAllPrograms({ approvalStatus, status });
  }

  @Patch('programs/:id/curate')
  async curateProgram(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
    @Body() dto: CurateProgramDto,
  ) {
    return this.adminService.curateProgram(id, req.user.id, dto);
  }
}
