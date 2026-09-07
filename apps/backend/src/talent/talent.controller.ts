import { 
  Controller, 
  Get, 
  Put, 
  Post, 
  Param, 
  Body, 
  UseGuards, 
  Req, 
  Res, 
  UseInterceptors, 
  UploadedFile, 
  BadRequestException, 
  NotFoundException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TalentService } from './talent.service';
import { UpdateTalentProfileDto } from './dto/update-talent-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import type { Response } from 'express';

@Controller('api/v1/talents')
export class TalentController {
  constructor(private readonly talentService: TalentService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TALENT)
  async getMyProfile(@Req() req: any) {
    return this.talentService.getMyProfile(req.user.id);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TALENT)
  async updateMyProfile(
    @Req() req: any,
    @Body() dto: UpdateTalentProfileDto,
  ) {
    return this.talentService.updateMyProfile(req.user.id, dto);
  }

  // ============================================================
  // UPLOAD BERKAS SERTIFIKAT KEAHLIAN / LISENSI (KHUSUS PDF, MAKS 5MB)
  // ============================================================
  @Post('upload-certificate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TALENT)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // Maksimal 5 MB
      fileFilter: (_req, file, callback) => {
        const isPdf = 
          file.mimetype === 'application/pdf' || 
          file.originalname.toLowerCase().endsWith('.pdf');
        if (!isPdf) {
          return callback(new BadRequestException('Format berkas harus PDF.'), false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadCertificate(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Berkas PDF sertifikat wajib diunggah.');
    }

    const uploadDir = path.resolve(process.cwd(), 'uploads', 'certificates');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.originalname).toLowerCase() || '.pdf';
    const safeBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 30);
    const uniqueFileName = `cert-${Date.now()}-${Math.round(Math.random() * 1e6)}-${safeBase}${ext}`;
    const targetPath = path.join(uploadDir, uniqueFileName);

    fs.writeFileSync(targetPath, file.buffer);

    return {
      status: 'success',
      message: 'Berkas sertifikat PDF berhasil diunggah.',
      data: {
        fileName: uniqueFileName,
        originalName: file.originalname,
        fileUrl: `/api/v1/talents/certificates/${uniqueFileName}`,
        fileSize: file.size,
      },
    };
  }

  // ============================================================
  // AKSES / PRATINJAU DOKUMEN SERTIFIKAT PDF
  // ============================================================
  @Get('certificates/:fileName')
  async getCertificateFile(@Param('fileName') fileName: string, @Res() res: Response) {
    const sanitized = path.basename(fileName);
    const filePath = path.resolve(process.cwd(), 'uploads', 'certificates', sanitized);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Berkas sertifikat tidak ditemukan.');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${sanitized}"`);
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.sendFile(filePath);
  }

  // ============================================================
  // UNGGAH FOTO PROFIL / PAS FOTO TALENTA (JPG/PNG/WEBP, Maks 2 MB)
  // ============================================================
  @Post('upload-avatar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TALENT)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 2 * 1024 * 1024 }, // Maksimal 2 MB
      fileFilter: (_req, file, callback) => {
        const isImage = 
          file.mimetype.startsWith('image/') ||
          /\.(jpg|jpeg|png|webp)$/i.test(file.originalname);
        if (!isImage) {
          return callback(new BadRequestException('Format foto harus berupa JPG, PNG, atau WEBP.'), false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadAvatar(@UploadedFile() file: any, @Req() req: any) {
    if (!file) {
      throw new BadRequestException('Berkas foto profil wajib diunggah.');
    }

    const uploadDir = path.resolve(process.cwd(), 'uploads', 'avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const uniqueFileName = `avatar-${req.user.id}-${Date.now()}${ext}`;
    const targetPath = path.join(uploadDir, uniqueFileName);

    fs.writeFileSync(targetPath, file.buffer);
    const fileUrl = `/api/v1/talents/avatar/${uniqueFileName}`;

    // Auto-update candidate's avatarUrl in DB
    await this.talentService.updateMyProfile(req.user.id, { avatarUrl: fileUrl });

    return {
      status: 'success',
      message: 'Foto profil berhasil diunggah.',
      data: {
        fileName: uniqueFileName,
        avatarUrl: fileUrl,
      },
    };
  }

  // ============================================================
  // AKSES / STREAMING FOTO PROFIL TALENTA
  // ============================================================
  @Get('avatar/:fileName')
  async getAvatarFile(@Param('fileName') fileName: string, @Res() res: Response) {
    const sanitized = path.basename(fileName);
    const filePath = path.resolve(process.cwd(), 'uploads', 'avatars', sanitized);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Foto profil tidak ditemukan.');
    }

    const ext = path.extname(sanitized).toLowerCase();
    let contentType = 'image/jpeg';
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.webp') contentType = 'image/webp';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.sendFile(filePath);
  }
}
