import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  async listUsers(page?: number, limit?: number, q?: string, role?: string) {
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (q && q.trim().length > 0) {
      where.OR = [
        { email: { contains: q.trim(), mode: 'insensitive' } },
        { talent: { fullName: { contains: q.trim(), mode: 'insensitive' } } },
        { employer: { companyName: { contains: q.trim(), mode: 'insensitive' } } },
      ];
    }
    if (role && Object.values(Role).includes(role as Role)) {
      where.role = role as Role;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          role: true,
          isVerified: true,
          createdAt: true,
          talent: {
            select: { fullName: true },
          },
          employer: {
            select: { companyName: true, nib: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      this.prisma.user.count({ where }),
    ]);

    const formatted = users.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      isVerified: u.isVerified,
      createdAt: u.createdAt.toISOString(),
      displayName: u.talent?.fullName || u.employer?.companyName || u.email.split('@')[0],
      detail: u.talent ? 'Talenta' : u.employer ? `Perusahaan (${u.employer.nib})` : 'Aparatur / Eksekutif',
    }));

    return {
      status: 'success',
      data: formatted,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    };
  }

  async updateUserRole(id: string, newRole: Role) {
    if (!Object.values(Role).includes(newRole)) {
      throw new BadRequestException(`Role "${newRole}" tidak valid.`);
    }

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan.');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { role: newRole },
      select: { id: true, email: true, role: true },
    });

    this.logger.log(`Role user ${user.email} diubah dari ${user.role} menjadi ${newRole}`);
    return {
      status: 'success',
      message: `Peran akun ${user.email} berhasil diubah menjadi ${newRole}.`,
      data: updated,
    };
  }

  async toggleUserStatus(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan.');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isVerified: !user.isVerified },
      select: { id: true, email: true, isVerified: true },
    });

    return {
      status: 'success',
      message: `Status verifikasi akun ${user.email} berhasil diperbarui.`,
      data: updated,
    };
  }
}
