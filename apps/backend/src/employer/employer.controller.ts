import {
  Controller,
  Get,
  Put,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
  ParseUUIDPipe,
} from '@nestjs/common';
import { EmployerService } from './employer.service';
import { UpdateEmployerProfileDto } from './dto/update-employer-profile.dto';
import { VerifyEmployerDto } from './dto/verify-employer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('api/v1/employers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmployerController {
  constructor(private readonly employerService: EmployerService) {}

  // ==================== KANAL EMPLOYER ====================
  @Get('me')
  @Roles(Role.EMPLOYER)
  async getMyProfile(@Req() req: any) {
    return this.employerService.getMyProfile(req.user.id);
  }

  @Put('me')
  @Roles(Role.EMPLOYER)
  async updateMyProfile(
    @Req() req: any,
    @Body() dto: UpdateEmployerProfileDto,
  ) {
    return this.employerService.updateMyProfile(req.user.id, dto);
  }

  // ==================== KANAL DISNAKER ADMIN ====================
  @Get('pending')
  @Roles(Role.DISNAKER_ADMIN)
  async getPendingEmployers() {
    return this.employerService.getPendingEmployers();
  }

  @Patch(':id/verify')
  @Roles(Role.DISNAKER_ADMIN)
  async verifyEmployer(
    @Param('id', ParseUUIDPipe) employerId: string,
    @Req() req: any,
    @Body() dto: VerifyEmployerDto,
  ) {
    return this.employerService.verifyEmployer(employerId, req.user.id, dto);
  }
}
