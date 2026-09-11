import {
  Controller,
  Get,
  Put,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
  Res,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EmployerService } from './employer.service';
import { UpdateEmployerProfileDto } from './dto/update-employer-profile.dto';
import { VerifyEmployerDto } from './dto/verify-employer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import type { Response } from 'express';

@Controller('api/v1/employers')
export class EmployerController {
  constructor(private readonly employerService: EmployerService) {}

  // ==================== KANAL EMPLOYER ====================
  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EMPLOYER)
  async getMyProfile(@Req() req: any) {
    return this.employerService.getMyProfile(req.user.id);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EMPLOYER)
  async updateMyProfile(
    @Req() req: any,
    @Body() dto: UpdateEmployerProfileDto,
  ) {
    return this.employerService.updateMyProfile(req.user.id, dto);
  }

  // ==================== UPLOAD LOGO RESMI PERUSAHAAN ====================
  @Post('upload-logo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EMPLOYER)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 2 * 1024 * 1024 }, // Maksimal 2 MB
      fileFilter: (_req, file, callback) => {
        const isImage =
          file.mimetype.startsWith('image/') ||
          /\.(jpg|jpeg|png|webp)$/i.test(file.originalname);
        if (!isImage) {
          return callback(new BadRequestException('Format logo harus berupa JPG, PNG, atau WEBP.'), false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadLogo(@UploadedFile() file: any, @Req() req: any) {
    if (!file) {
      throw new BadRequestException('Berkas logo perusahaan wajib diunggah.');
    }

    let uploadDir = path.resolve(process.cwd(), 'uploads', 'logos');
    if (!fs.existsSync(uploadDir)) {
      const alt = path.resolve(process.cwd(), 'apps', 'backend', 'uploads', 'logos');
      if (fs.existsSync(path.dirname(alt))) uploadDir = alt;
    }
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const uniqueFileName = `logo-${req.user.id}-${Date.now()}${ext}`;
    const targetPath = path.join(uploadDir, uniqueFileName);

    fs.writeFileSync(targetPath, file.buffer);
    const fileUrl = `/api/v1/employers/logo/${uniqueFileName}`;

    await this.employerService.updateMyProfile(req.user.id, { logoUrl: fileUrl });

    return {
      status: 'success',
      message: 'Logo resmi perusahaan berhasil diunggah.',
      data: {
        fileName: uniqueFileName,
        logoUrl: fileUrl,
      },
    };
  }

  @Get('logo/:fileName')
  async getLogoFile(@Param('fileName') fileName: string, @Res() res: Response) {
    const sanitized = path.basename(fileName);
    let filePath = path.resolve(process.cwd(), 'uploads', 'logos', sanitized);
    if (!fs.existsSync(filePath)) {
      const alt = path.resolve(process.cwd(), 'apps', 'backend', 'uploads', 'logos', sanitized);
      if (fs.existsSync(alt)) filePath = alt;
    }

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Logo perusahaan tidak ditemukan.');
    }

    const ext = path.extname(sanitized).toLowerCase();
    let contentType = 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.webp') contentType = 'image/webp';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.sendFile(filePath);
  }

  // ==================== UPLOAD DOKUMEN NIB OSS (PDF) ====================
  @Post('upload-nib-doc')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EMPLOYER)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // Maksimal 5 MB
      fileFilter: (_req, file, callback) => {
        const isPdf =
          file.mimetype === 'application/pdf' ||
          file.originalname.toLowerCase().endsWith('.pdf');
        if (!isPdf) {
          return callback(new BadRequestException('Format dokumen izin NIB harus berupa PDF.'), false);
        }
        callback(null, true);
      },
    }),
  )
  async uploadNibDoc(@UploadedFile() file: any, @Req() req: any) {
    if (!file) {
      throw new BadRequestException('Berkas PDF NIB wajib diunggah.');
    }

    let uploadDir = path.resolve(process.cwd(), 'uploads', 'nibs');
    if (!fs.existsSync(uploadDir)) {
      const alt = path.resolve(process.cwd(), 'apps', 'backend', 'uploads', 'nibs');
      if (fs.existsSync(path.dirname(alt))) uploadDir = alt;
    }
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uniqueFileName = `nib-${req.user.id}-${Date.now()}.pdf`;
    const targetPath = path.join(uploadDir, uniqueFileName);

    fs.writeFileSync(targetPath, file.buffer);
    const fileUrl = `/api/v1/employers/nib-doc/${uniqueFileName}`;

    await this.employerService.updateMyProfile(req.user.id, { nibDocUrl: fileUrl });

    return {
      status: 'success',
      message: 'Dokumen legalitas NIB berhasil diunggah.',
      data: {
        fileName: uniqueFileName,
        nibDocUrl: fileUrl,
      },
    };
  }

  @Get('nib-doc/:fileName')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.EMPLOYER, Role.DISNAKER_ADMIN, Role.SUPERADMIN, Role.EXECUTIVE) // PROTECTED VARIATIONS: Hanya korporat berwenang & aparatur pemerintah
  async getNibDocFile(@Param('fileName') fileName: string, @Res() res: Response) {
    const sanitized = path.basename(fileName);
    let filePath = path.resolve(process.cwd(), 'uploads', 'nibs', sanitized);
    if (!fs.existsSync(filePath)) {
      const alt = path.resolve(process.cwd(), 'apps', 'backend', 'uploads', 'nibs', sanitized);
      if (fs.existsSync(alt)) filePath = alt;
    }

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Dokumen NIB tidak ditemukan.');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${sanitized}"`);
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.sendFile(filePath);
  }

  // ==================== KANAL DISNAKER ADMIN ====================
  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DISNAKER_ADMIN, Role.SUPERADMIN)
  async getPendingEmployers() {
    return this.employerService.getPendingEmployers();
  }

  @Patch(':id/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DISNAKER_ADMIN, Role.SUPERADMIN)
  async verifyEmployer(
    @Param('id', ParseUUIDPipe) employerId: string,
    @Req() req: any,
    @Body() dto: VerifyEmployerDto,
  ) {
    return this.employerService.verifyEmployer(employerId, req.user.id, dto);
  }
}

