import {
  Injectable,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HashService } from '../common/services/hash.service';
import { MailService } from '../mail/mail.service';
import { OtpPurpose } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class OtpService {
  private readonly TTL_MINUTES = 5;
  private readonly COOLDOWN_SECONDS = 60;
  private readonly MAX_ATTEMPTS = 3;

  constructor(
    private readonly prisma: PrismaService,
    private readonly hashService: HashService,
    private readonly mailService: MailService,
  ) {}

  async generateAndSendOtp(
    email: string,
    purpose: OtpPurpose,
  ): Promise<{ cooldownSeconds: number }> {
    const now = new Date();

    // 1. Cek Proteksi Cooldown (Anti-Spam 60 Detik untuk email ini)
    const recentOtp = await this.prisma.emailVerification.findFirst({
      where: { email },
      orderBy: { createdAt: 'desc' },
    });

    if (recentOtp) {
      const diffInSeconds = Math.floor(
        (now.getTime() - recentOtp.createdAt.getTime()) / 1000,
      );
      if (diffInSeconds < this.COOLDOWN_SECONDS) {
        const remaining = this.COOLDOWN_SECONDS - diffInSeconds;
        throw new BadRequestException(
          `Mohon tunggu ${remaining} detik sebelum meminta kode baru.`,
        );
      }
    }

    // 2. Generate 6 Digit Angka Menggunakan Kriptografi Kuat
    const plainOtp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await this.hashService.hashOtp(plainOtp);

    // 3. Hitung Waktu Kedaluwarsa (T + 5 Menit)
    const expiresAt = new Date(now.getTime() + this.TTL_MINUTES * 60 * 1000);

    // 4. Bersihkan OTP Lama untuk Email & Tujuan Ini, Lalu Simpan yang Baru
    await this.prisma.$transaction([
      this.prisma.emailVerification.deleteMany({
        where: { email, purpose },
      }),
      this.prisma.emailVerification.create({
        data: {
          email,
          purpose,
          otpHash,
          expiresAt,
          attempts: 0,
        },
      }),
    ]);

    // 5. Kirimkan Kode Fisik Melalui MailService
    await this.mailService.sendOtpEmail(email, plainOtp);

    return { cooldownSeconds: this.COOLDOWN_SECONDS };
  }

  async verifyOtp(
    email: string,
    purpose: OtpPurpose,
    plainOtp: string,
  ): Promise<boolean> {
    const now = new Date();

    // 1. Ambil Record OTP Aktif
    const verification = await this.prisma.emailVerification.findFirst({
      where: { email, purpose },
    });

    if (!verification) {
      throw new BadRequestException(
        'Kode verifikasi tidak ditemukan. Silakan minta kode baru.',
      );
    }

    // 2. Cek Masa Berlaku
    if (now > verification.expiresAt) {
      await this.prisma.emailVerification.delete({
        where: { id: verification.id },
      });
      throw new BadRequestException(
        'Kode verifikasi telah kedaluwarsa. Silakan minta kode baru.',
      );
    }

    // 3. Cek Batas Maksimal Kesalahan Input (Brute Force Guard)
    if (verification.attempts >= this.MAX_ATTEMPTS) {
      await this.prisma.emailVerification.delete({
        where: { id: verification.id },
      });
      throw new HttpException(
        'Anda telah salah memasukkan kode sebanyak 3 kali. Silakan minta kode baru.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 4. Komparasi Hash OTP
    const isMatch = await this.hashService.compareOtp(
      plainOtp,
      verification.otpHash,
    );

    if (!isMatch) {
      // Increment percobaan gagal
      const updatedAttempts = verification.attempts + 1;
      await this.prisma.emailVerification.update({
        where: { id: verification.id },
        data: { attempts: updatedAttempts },
      });

      const remaining = this.MAX_ATTEMPTS - updatedAttempts;
      throw new BadRequestException(
        `Kode verifikasi salah. Sisa kesempatan: ${remaining} kali.`,
      );
    }

    // 5. Validasi Sukses -> Hapus OTP dari Database (Single-Use Token)
    await this.prisma.emailVerification.delete({
      where: { id: verification.id },
    });

    return true;
  }
}
