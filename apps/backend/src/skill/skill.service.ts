import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SkillService {
  private readonly logger = new Logger(SkillService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Autocomplete search untuk form profil talenta & filter lowongan
  async searchSkills(q?: string, category?: string) {
    const whereClause: any = {};

    if (q && q.trim().length > 0) {
      whereClause.name = {
        contains: q.trim(),
        mode: 'insensitive',
      };
    }

    if (category && category.trim().length > 0) {
      whereClause.category = category.trim();
    }

    const skills = await this.prisma.masterSkill.findMany({
      where: whereClause,
      take: 30,
      orderBy: { name: 'asc' },
    });

    return {
      status: 'success',
      data: skills,
    };
  }

  // Listing seluruh master keahlian untuk Superadmin Console
  async getAllSkills(page?: number, limit?: number, q?: string, category?: string) {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 12));
    const skip = (pageNum - 1) * limitNum;

    const whereClause: any = {};

    if (q && q.trim().length > 0) {
      whereClause.name = {
        contains: q.trim(),
        mode: 'insensitive',
      };
    }

    if (category && category.trim().length > 0) {
      whereClause.category = category.trim();
    }

    const [skills, total] = await Promise.all([
      this.prisma.masterSkill.findMany({
        where: whereClause,
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
        skip,
        take: limitNum,
      }),
      this.prisma.masterSkill.count({ where: whereClause }),
    ]);

    return {
      status: 'success',
      data: skills,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    };
  }

  // Tambah Master Keahlian Baru oleh Superadmin
  async createSkill(data: { name: string; category: string; description?: string }) {
    const existing = await this.prisma.masterSkill.findUnique({
      where: { name: data.name.trim() },
    });

    if (existing) {
      throw new ConflictException(`Keahlian "${data.name}" sudah terdaftar di master.`);
    }

    const skill = await this.prisma.masterSkill.create({
      data: {
        name: data.name.trim(),
        category: data.category.trim(),
        description: data.description?.trim() || null,
      },
    });

    this.logger.log(`Superadmin menambahkan master keahlian: ${skill.name} (${skill.category})`);

    return {
      status: 'success',
      message: 'Master keahlian berhasil ditambahkan',
      data: skill,
    };
  }

  // Hapus Master Keahlian oleh Superadmin
  async deleteSkill(id: string) {
    const existing = await this.prisma.masterSkill.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Master keahlian tidak ditemukan.');
    }

    await this.prisma.masterSkill.delete({ where: { id } });
    this.logger.log(`Superadmin menghapus master keahlian: ${existing.name}`);

    return {
      status: 'success',
      message: `Master keahlian "${existing.name}" berhasil dihapus.`,
    };
  }
}
