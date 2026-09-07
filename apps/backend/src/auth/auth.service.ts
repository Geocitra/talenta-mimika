import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HashService } from '../common/services/hash.service';
import { OtpService } from '../otp/otp.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterTalentDto } from './dto/register-talent.dto';
import { RegisterEmployerDto } from './dto/register-employer.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginPasswordDto } from './dto/login-password.dto';
import { Role, OtpPurpose, VerificationStatus, type User } from '@prisma/client';
import type { Response } from 'express';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly hashService: HashService,
    private readonly otpService: OtpService,
    private readonly jwtService: JwtService,
  ) {}

  // ============================================================
  // USE CASE 1 & 2: REGISTRASI TALENTA & EMPLOYER
  // ============================================================
  async registerTalent(dto: RegisterTalentDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) throw new ConflictException('Alamat email sudah terdaftar.');

    const existingNik = await this.prisma.talent.findUnique({ where: { nik: dto.nik } });
    if (existingNik) throw new ConflictException('NIK ini sudah terdaftar.');

    const passwordHash = dto.password ? await this.hashService.hashPassword(dto.password) : null;

    try {
      await this.prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: { email: dto.email, passwordHash, role: Role.TALENT, isVerified: false },
        });

        await tx.talent.create({
          data: {
            id: newUser.id,
            nik: dto.nik,
            fullName: dto.fullName,
            birthDate: new Date(dto.birthDate),
          },
        });
      });

      const otpResult = await this.otpService.generateAndSendOtp(dto.email, OtpPurpose.REGISTRATION);

      return {
        status: 'success',
        message: 'Pendaftaran akun Talenta berhasil. Silakan verifikasi email Anda.',
        data: { email: dto.email, role: Role.TALENT, cooldownSeconds: otpResult.cooldownSeconds },
      };
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException('Terjadi kesalahan pendaftaran.');
    }
  }

  async registerEmployer(dto: RegisterEmployerDto) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existingUser) throw new ConflictException('Alamat email sudah terdaftar.');

    const existingNib = await this.prisma.employer.findUnique({ where: { nib: dto.nib } });
    if (existingNib) throw new ConflictException('NIB ini sudah terdaftar.');

    const passwordHash = dto.password ? await this.hashService.hashPassword(dto.password) : null;

    try {
      await this.prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: { email: dto.email, passwordHash, role: Role.EMPLOYER, isVerified: false },
        });

        await tx.employer.create({
          data: { id: newUser.id, nib: dto.nib, companyName: dto.companyName },
        });
      });

      const otpResult = await this.otpService.generateAndSendOtp(dto.email, OtpPurpose.REGISTRATION);

      return {
        status: 'success',
        message: 'Pendaftaran perusahaan berhasil. Silakan verifikasi email Anda.',
        data: { email: dto.email, role: Role.EMPLOYER, cooldownSeconds: otpResult.cooldownSeconds },
      };
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException('Terjadi kesalahan pendaftaran.');
    }
  }

  // ============================================================
  // USE CASE 3: VERIFIKASI OTP & LOGIN SESI
  // ============================================================
  async verifyOtpAndLogin(dto: VerifyOtpDto, res: Response) {
    // 1. Verifikasi kecocokan OTP via OtpService
    await this.otpService.verifyOtp(dto.email, dto.purpose, dto.otpCode);

    // 2. Ambil data Pengguna
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { talent: true, employer: true },
    });

    if (!user) {
      throw new NotFoundException('Data pengguna tidak ditemukan.');
    }

    // 3. Jika tujuannya registrasi, tandai akun sebagai terverifikasi aktif
    if (!user.isVerified) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });
    }

    // 4. Terbitkan HttpOnly Cookie Token
    this.issueSessionCookie(user, res);

    return {
      status: 'success',
      message: 'Autentikasi OTP berhasil.',
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.talent || user.employer,
      },
    };
  }

  // ============================================================
  // USE CASE 4: REQUEST LOGIN VIA OTP (PASSWORDLESS)
  // ============================================================
  async sendLoginOtp(identifier: string) {
    const user = await this.findUserByIdentifier(identifier);
    if (!user) {
      throw new NotFoundException('Akun dengan email atau NIK tersebut tidak ditemukan.');
    }

    const otpResult = await this.otpService.generateAndSendOtp(user.email, OtpPurpose.LOGIN);

    return {
      status: 'success',
      message: 'Kode OTP masuk telah dikirim ke email terdaftar Anda.',
      data: {
        email: user.email,
        cooldownSeconds: otpResult.cooldownSeconds,
      },
    };
  }

  // ============================================================
  // USE CASE 4B: RESEND REGISTRATION OTP
  // ============================================================
  async resendRegistrationOtp(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('Akun dengan email tersebut tidak ditemukan.');
    }

    if (user.isVerified) {
      throw new BadRequestException('Akun sudah terverifikasi. Silakan langsung masuk.');
    }

    const otpResult = await this.otpService.generateAndSendOtp(user.email, OtpPurpose.REGISTRATION);

    return {
      status: 'success',
      message: 'Kode OTP verifikasi registrasi baru telah dikirim ke email Anda.',
      data: {
        email: user.email,
        cooldownSeconds: otpResult.cooldownSeconds,
      },
    };
  }

  // ============================================================
  // USE CASE 5: LOGIN MENGGUNAKAN KATA SANDI
  // ============================================================
  async loginWithPassword(dto: LoginPasswordDto, res: Response) {
    const user = await this.findUserByIdentifier(dto.identifier);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Email/NIK atau kata sandi tidak cocok.');
    }

    const isPasswordValid = await this.hashService.comparePassword(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email/NIK atau kata sandi tidak cocok.');
    }

    if (!user.isVerified && (user.role as string) !== 'SUPERADMIN') {
      throw new BadRequestException('Akun Anda belum diverifikasi. Silakan login menggunakan OTP terlebih dahulu.');
    }

    this.issueSessionCookie(user, res);

    return {
      status: 'success',
      message: 'Login berhasil.',
      data: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.talent || user.employer,
      },
    };
  }

  // ============================================================
  // USE CASE 6: LOGOUT (BERSIHKAN COOKIE)
  // ============================================================
  logout(res: Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: false, // ubah jadi true jika produksi HTTPS
      sameSite: 'lax',
      path: '/',
    });

    return {
      status: 'success',
      message: 'Anda berhasil keluar dari sistem.',
    };
  }

  // ============================================================
  // HELPER METHODS (PRIVATE ENCAPSULATION)
  // ============================================================
  private async findUserByIdentifier(identifier: string) {
    const isEmail = identifier.includes('@');
    if (isEmail) {
      return this.prisma.user.findUnique({
        where: { email: identifier },
        include: { talent: true, employer: true },
      });
    }

    // Jika bukan email, asumsikan sebagai NIK
    const talent = await this.prisma.talent.findUnique({
      where: { nik: identifier },
      include: {
        user: {
          include: { talent: true, employer: true },
        },
      },
    });

    return talent ? talent.user : null;
  }

  private issueSessionCookie(user: User, res: Response) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: false, // Ubah ke true saat di server produksi HTTPS
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // Berlaku 7 hari
      path: '/',
    });
  }
}
