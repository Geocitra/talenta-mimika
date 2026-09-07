import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateTalentProfileDto } from './dto/update-talent-profile.dto';

@Injectable()
export class TalentService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyProfile(userId: string) {
    const talent = await this.prisma.talent.findUnique({
      where: { id: userId },
      include: {
        user: {
          select: { email: true, isVerified: true, role: true },
        },
      },
    });

    if (!talent) {
      throw new NotFoundException('Profil talenta tidak ditemukan.');
    }

    return {
      status: 'success',
      data: talent,
    };
  }

  async updateMyProfile(userId: string, dto: UpdateTalentProfileDto) {
    // 1. Ambil data profil eksisting
    const talent = await this.prisma.talent.findUnique({
      where: { id: userId },
    });

    if (!talent) {
      throw new NotFoundException('Profil talenta tidak ditemukan.');
    }

    // 2. Hitung Completeness Score baru berdasarkan input gabungan
    const phone = dto.phone ?? talent.phone;
    const bio = dto.bio ?? talent.bio;
    const education = (dto.education ?? talent.education) as any[];
    const workExperience = (dto.workExperience ?? talent.workExperience) as any[];
    const skills = (dto.skills ?? talent.skills) as any[];
    const certifications = (dto.certifications ?? (talent as any).certifications) as any[];

    const completenessScore = this.calculateCompletenessScore({
      hasBasicData: !!talent.nik && !!talent.fullName,
      hasContactAndBio: !!phone && !!bio,
      hasEducation: Array.isArray(education) && education.length > 0,
      hasWorkExperience: Array.isArray(workExperience) && workExperience.length > 0,
      hasSkills: Array.isArray(skills) && skills.length > 0,
      hasCertifications: Array.isArray(certifications) && certifications.length > 0,
    });

    // 3. Simpan pembaruan ke database
    const updatedTalent = await this.prisma.talent.update({
      where: { id: userId },
      data: {
        phone: dto.phone,
        bio: dto.bio,
        avatarUrl: dto.avatarUrl !== undefined ? dto.avatarUrl : undefined,
        education: dto.education !== undefined ? dto.education : undefined,
        workExperience: dto.workExperience !== undefined ? dto.workExperience : undefined,
        skills: dto.skills !== undefined ? dto.skills : undefined,
        certifications: dto.certifications !== undefined ? dto.certifications : undefined,
        socialDna: dto.socialDna !== undefined ? dto.socialDna : undefined,
        isAvailable: dto.isAvailable !== undefined ? dto.isAvailable : undefined,
        profileCompletenessScore: completenessScore,
      },
    });

    return {
      status: 'success',
      message: 'Profil talenta berhasil diperbarui dan siap ditemukan oleh perusahaan.',
      data: updatedTalent,
    };
  }

  // Information Expert: Menghitung persentase kelengkapan profil
  private calculateCompletenessScore(criteria: {
    hasBasicData: boolean;
    hasContactAndBio: boolean;
    hasEducation: boolean;
    hasWorkExperience: boolean;
    hasSkills: boolean;
    hasCertifications: boolean;
  }): number {
    let score = 0;
    if (criteria.hasBasicData) score += 20; // Data NIK, Nama, Tgl Lahir
    if (criteria.hasContactAndBio) score += 15; // No HP dan Bio perkenalan
    if (criteria.hasEducation) score += 20; // Riwayat pendidikan
    if (criteria.hasWorkExperience) score += 20; // Pengalaman kerja lapangan
    if (criteria.hasSkills) score += 15; // Minimal 1 keahlian teknis
    if (criteria.hasCertifications) score += 10; // Sertifikat / Lisensi Keahlian (PDF)
    return Math.min(100, score);
  }
}
