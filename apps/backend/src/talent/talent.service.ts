import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateTalentProfileDto } from './dto/update-talent-profile.dto';
import { SkillMergePolicy, SkillRecord } from './policies/skill-merge.policy';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TalentService {
  private readonly logger = new Logger(TalentService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getMyProfile(userId: string) {
    const talent = await this.prisma.talent.findUnique({
      where: { id: userId },
      include: {
        user: {
          select: { email: true, isVerified: true, role: true },
        },
        approaches: {
          include: {
            vacancy: {
              include: {
                employer: {
                  select: {
                    companyName: true,
                    logoUrl: true,
                    nib: true,
                    industrySector: true,
                    address: true,
                    picName: true,
                    picPhone: true,
                    verificationStatus: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
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
    // Jalankan seluruh mutasi dalam transaksi ACID
    let oldCertsToPurge: any[] = [];
    let newCertsToPurge: any[] = [];

    const updatedTalent = await this.prisma.$transaction(async (tx) => {
      // 1. Ambil data profil eksisting
      const currentTalent = await tx.talent.findUnique({
        where: { id: userId },
      });

      if (!currentTalent) {
        throw new NotFoundException('Profil talenta tidak ditemukan.');
      }

      // 2. Optimistic Concurrency Control (OCC Guard)
      // Mencegah penimpaan data (stale write) jika talenta membuka form lama saat LMS menginjeksi skill baru
      if (dto.lastUpdatedAt) {
        const clientTime = new Date(dto.lastUpdatedAt).getTime();
        const serverTime = currentTalent.updatedAt.getTime();
        if (!isNaN(clientTime) && serverTime - clientTime > 1000) {
          throw new ConflictException(
            'Profil Anda telah diperbarui oleh sesi atau kegiatan lain (misal: kelulusan pelatihan). Mohon muat ulang halaman sebelum menyimpan.',
          );
        }
      }

      // 3. Smart Skill Merge (Domain Policy)
      // Menjamin keahlian resmi LMS tidak terhapus atau diturunkan oleh input manual
      const currentSkills = (Array.isArray(currentTalent.skills)
        ? currentTalent.skills
        : []) as unknown as SkillRecord[];
      const incomingSkills =
        dto.skills !== undefined
          ? (dto.skills as unknown as SkillRecord[])
          : currentSkills;
      const mergedSkills = SkillMergePolicy.mergeSkills(currentSkills, incomingSkills);

      // 4. Deteksi Berkas Sertifikat
      const oldCerts = (Array.isArray(currentTalent.certifications)
        ? currentTalent.certifications
        : []) as any[];
      const newCerts =
        dto.certifications !== undefined
          ? (dto.certifications as any[])
          : oldCerts;

      oldCertsToPurge = oldCerts;
      newCertsToPurge = newCerts;

      // 5. Kalkulasi Skor Kelengkapan Dinamis
      const phone = dto.phone ?? currentTalent.phone;
      const bio = dto.bio ?? currentTalent.bio;
      const education = (dto.education ?? currentTalent.education) as any[];
      const workExperience = (dto.workExperience ?? currentTalent.workExperience) as any[];

      const completenessScore = this.calculateCompletenessScore({
        hasBasicData: !!currentTalent.nik && !!currentTalent.fullName,
        hasContactAndBio: !!phone && !!bio,
        hasEducation: Array.isArray(education) && education.length > 0,
        hasWorkExperience: Array.isArray(workExperience) && workExperience.length > 0,
        hasSkills: mergedSkills.length > 0,
        hasCertifications: Array.isArray(newCerts) && newCerts.length > 0,
      });

      // 6. Persistensi Pembaruan ke Database
      return tx.talent.update({
        where: { id: userId },
        data: {
          phone: dto.phone,
          bio: dto.bio,
          avatarUrl: dto.avatarUrl !== undefined ? dto.avatarUrl : undefined,
          education: dto.education !== undefined ? (dto.education as any) : undefined,
          workExperience: dto.workExperience !== undefined ? (dto.workExperience as any) : undefined,
          skills: mergedSkills as any,
          certifications: dto.certifications !== undefined ? (newCerts as any) : undefined,
          socialDna: dto.socialDna !== undefined ? (dto.socialDna as any) : undefined,
          isAvailable: dto.isAvailable !== undefined ? dto.isAvailable : undefined,
          profileCompletenessScore: completenessScore,
        },
      });
    });

    // 7. Pembersihan Berkas Fisik Yatim (Orphan File Purge - Post-Commit)
    if (dto.certifications !== undefined) {
      this.purgeOrphanCertificates(oldCertsToPurge, newCertsToPurge);
    }

    this.logger.log(
      `Profil talenta ${updatedTalent.fullName} (ID: ${userId}) berhasil dimutakhirkan. Skor kelengkapan: ${updatedTalent.profileCompletenessScore}%.`,
    );

    return {
      status: 'success',
      message: 'Profil talenta berhasil diperbarui dan telah disinkronkan ke radar industri.',
      data: updatedTalent,
    };
  }

  // Pure Fabrication: Membersihkan fisik berkas PDF yang tidak lagi dirujuk di database
  private purgeOrphanCertificates(oldCerts: any[], newCerts: any[]) {
    if (!Array.isArray(oldCerts) || !Array.isArray(newCerts)) return;

    const newFileUrls = new Set(newCerts.map((c) => c?.fileUrl).filter(Boolean));
    let uploadDir = path.resolve(process.cwd(), 'uploads', 'certificates');
    if (!fs.existsSync(uploadDir)) {
      const altDir = path.resolve(process.cwd(), 'apps', 'backend', 'uploads', 'certificates');
      if (fs.existsSync(altDir)) {
        uploadDir = altDir;
      }
    }

    for (const oldCert of oldCerts) {
      if (oldCert?.fileUrl && !newFileUrls.has(oldCert.fileUrl)) {
        const fileName = path.basename(oldCert.fileUrl);
        const targetPath = path.join(uploadDir, fileName);

        fs.unlink(targetPath, (err) => {
          if (err) {
            if (err.code !== 'ENOENT') {
              this.logger.warn(`Gagal menghapus berkas orphan PDF: ${fileName}. Error: ${err.message}`);
            }
          } else {
            this.logger.log(`Berkas orphan PDF berhasil dibersihkan: ${fileName}`);
          }
        });
      }
    }
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
