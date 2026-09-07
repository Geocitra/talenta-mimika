import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SkillService } from './skill.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('api/v1/skills')
export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  // ============================================================
  // 1. ENDPOINT PENCARIAN AUTOCOMPLETE (PUBLIK / TALENTA)
  // ============================================================
  @Get('search')
  async search(
    @Query('q') q?: string,
    @Query('category') category?: string,
  ) {
    return this.skillService.searchSkills(q, category);
  }

  // ============================================================
  // 2. ENDPOINT ADMIN / SUPERADMIN: LIST SELURUH MASTER KEAHLIAN
  // ============================================================
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DISNAKER_ADMIN, Role.SUPERADMIN)
  async getAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('q') q?: string,
    @Query('category') category?: string,
  ) {
    return this.skillService.getAllSkills(page, limit, q, category);
  }

  // ============================================================
  // 3. ENDPOINT ADMIN / SUPERADMIN: TAMBAH MASTER KEAHLIAN
  // ============================================================
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DISNAKER_ADMIN, Role.SUPERADMIN)
  async create(
    @Body() body: { name: string; category: string; description?: string },
  ) {
    return this.skillService.createSkill(body);
  }

  // ============================================================
  // 4. ENDPOINT ADMIN / SUPERADMIN: HAPUS MASTER KEAHLIAN
  // ============================================================
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DISNAKER_ADMIN, Role.SUPERADMIN)
  async delete(@Param('id') id: string) {
    return this.skillService.deleteSkill(id);
  }
}
