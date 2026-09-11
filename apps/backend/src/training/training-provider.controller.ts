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
  Query,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TrainingProviderService } from './training-provider.service';
import { BatchGraduationService } from './services/batch-graduation.service';
import { UpdateTrainingProviderProfileDto } from './dto/update-training-provider-profile.dto';
import { VerifyTrainingProviderDto } from './dto/verify-training-provider.dto';
import { CreateProgramStudioDto } from './dto/create-program-studio.dto';
import { CreateBatchDto, UpdateBatchDto } from './dto/create-batch.dto';
import { BulkGraduationDto } from './dto/bulk-graduation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, VerificationStatus, InstitutionType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import type { Response } from 'express';

@Controller('api/v1/training-providers')
export class TrainingProviderController {
  constructor(
    private readonly providerService: TrainingProviderService,
    private readonly graduationService: BatchGraduationService,
  ) {}

  // ==================== KANAL TRAINING PROVIDER ====================
  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TRAINING_PROVIDER)
  async getMyProfile(@Req() req: any) {
    return this.providerService.getMyProfile(req.user.id);
  }

  @Put('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TRAINING_PROVIDER)
  async updateMyProfile(
    @Req() req: any,
    @Body() dto: UpdateTrainingProviderProfileDto,
  ) {
    return this.providerService.updateMyProfile(req.user.id, dto);
  }

  // ==================== STUDIO PROGRAM PELATIHAN ====================
  @Post('programs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TRAINING_PROVIDER)
  async createProgramStudio(
    @Req() req: any,
    @Body() dto: CreateProgramStudioDto,
  ) {
    return this.providerService.createProgramStudio(req.user.id, dto);
  }

  @Get('programs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TRAINING_PROVIDER)
  async getMyPrograms(@Req() req: any) {
    return this.providerService.getMyPrograms(req.user.id);
  }

  @Get('programs/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TRAINING_PROVIDER)
  async getProgramDetail(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.providerService.getProgramDetail(req.user.id, id);
  }

  // ==================== MANAJEMEN BATCH COHORT ====================
  @Post('programs/:programId/batches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TRAINING_PROVIDER)
  async createBatch(
    @Req() req: any,
    @Param('programId', ParseUUIDPipe) programId: string,
    @Body() dto: CreateBatchDto,
  ) {
    return this.providerService.createBatch(req.user.id, programId, dto);
  }

  @Patch('batches/:batchId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TRAINING_PROVIDER)
  async updateBatch(
    @Req() req: any,
    @Param('batchId', ParseUUIDPipe) batchId: string,
    @Body() dto: UpdateBatchDto,
  ) {
    return this.providerService.updateBatch(req.user.id, batchId, dto);
  }

  @Get('batches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TRAINING_PROVIDER)
  async getMyBatches(@Req() req: any) {
    return this.providerService.getMyBatches(req.user.id);
  }

  @Get('batches/:batchId/participants')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TRAINING_PROVIDER, Role.DISNAKER_ADMIN, Role.SUPERADMIN)
  async getBatchParticipants(
    @Req() req: any,
    @Param('batchId', ParseUUIDPipe) batchId: string,
  ) {
    const isDisnaker = req.user.role === Role.DISNAKER_ADMIN || req.user.role === Role.SUPERADMIN;
    return this.graduationService.getBatchParticipants(batchId, req.user.id, isDisnaker);
  }

  @Post('batches/:batchId/graduate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TRAINING_PROVIDER, Role.DISNAKER_ADMIN, Role.SUPERADMIN)
  async executeBulkGraduation(
    @Req() req: any,
    @Param('batchId', ParseUUIDPipe) batchId: string,
    @Body() dto: BulkGraduationDto,
  ) {
    const isDisnaker = req.user.role === Role.DISNAKER_ADMIN || req.user.role === Role.SUPERADMIN;
    return this.graduationService.executeBulkGraduation(batchId, req.user.id, dto, isDisnaker);
  }

  // ==================== UPLOAD LOGO LEMBAGA ====================
  @Post('upload-logo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TRAINING_PROVIDER)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 2 * 1024 * 1024 }, // Maksimal 2 MB
      fileFilter: (_req, file, callback) => {
        const isImage =
          file.mimetype.startsWith('image/') ||
          /\.(jpg|jpeg|png|webp)$/i.test(file.originalname);
        if (!isImage) {
          return callback(
            new BadRequestException('Format logo harus berupa JPG, PNG, atau WEBP.'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadLogo(@UploadedFile() file: any, @Req() req: any) {
    if (!file) {
      throw new BadRequestException('Berkas foto/logo wajib diunggah.');
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
    const uniqueFileName = `provider-logo-${req.user.id}-${Date.now()}${ext}`;
    const targetPath = path.join(uploadDir, uniqueFileName);

    fs.writeFileSync(targetPath, file.buffer);
    const fileUrl = `/uploads/logos/${uniqueFileName}`;

    await this.providerService.updateMyProfile(req.user.id, { logoUrl: fileUrl });

    return {
      status: 'success',
      message: 'Logo lembaga pelatihan berhasil diperbarui.',
      data: {
        fileName: uniqueFileName,
        logoUrl: fileUrl,
      },
    };
  }

  // ==================== UPLOAD DOKUMEN LEGALITAS VIN/BNSP (PDF) ====================
  @Post('upload-legal-doc')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TRAINING_PROVIDER)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // Maksimal 5 MB
      fileFilter: (_req, file, callback) => {
        const isPdf =
          file.mimetype === 'application/pdf' ||
          file.originalname.toLowerCase().endsWith('.pdf');
        if (!isPdf) {
          return callback(
            new BadRequestException('Format dokumen legalitas harus berupa PDF.'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadLegalDoc(@UploadedFile() file: any, @Req() req: any) {
    if (!file) {
      throw new BadRequestException('Berkas PDF legalitas wajib diunggah.');
    }

    let uploadDir = path.resolve(process.cwd(), 'uploads', 'provider-docs');
    if (!fs.existsSync(uploadDir)) {
      const alt = path.resolve(process.cwd(), 'apps', 'backend', 'uploads', 'provider-docs');
      if (fs.existsSync(path.dirname(alt))) uploadDir = alt;
    }
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uniqueFileName = `provider-legal-${req.user.id}-${Date.now()}.pdf`;
    const targetPath = path.join(uploadDir, uniqueFileName);

    fs.writeFileSync(targetPath, file.buffer);
    const fileUrl = `/api/v1/training-providers/legal-doc/${uniqueFileName}`;

    await this.providerService.updateMyProfile(req.user.id, { legalDocUrl: fileUrl });

    return {
      status: 'success',
      message: 'Dokumen legalitas lembaga berhasil diunggah.',
      data: {
        fileName: uniqueFileName,
        legalDocUrl: fileUrl,
      },
    };
  }

  @Get('legal-doc/:fileName')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TRAINING_PROVIDER, Role.DISNAKER_ADMIN, Role.SUPERADMIN, Role.EXECUTIVE)
  async getLegalDocFile(@Param('fileName') fileName: string, @Res() res: Response) {
    const sanitized = path.basename(fileName);
    let filePath = path.resolve(process.cwd(), 'uploads', 'provider-docs', sanitized);
    if (!fs.existsSync(filePath)) {
      const alt = path.resolve(process.cwd(), 'apps', 'backend', 'uploads', 'provider-docs', sanitized);
      if (fs.existsSync(alt)) filePath = alt;
    }

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Dokumen legalitas tidak ditemukan.');
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
  async getPendingProviders() {
    return this.providerService.getPendingProviders();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DISNAKER_ADMIN, Role.SUPERADMIN, Role.EXECUTIVE)
  async getAllProviders(
    @Query('status') status?: VerificationStatus,
    @Query('type') type?: InstitutionType,
  ) {
    return this.providerService.getAllProviders({ status, type });
  }

  @Patch(':id/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.DISNAKER_ADMIN, Role.SUPERADMIN)
  async verifyProvider(
    @Param('id', ParseUUIDPipe) providerId: string,
    @Req() req: any,
    @Body() dto: VerifyTrainingProviderDto,
  ) {
    return this.providerService.verifyProvider(providerId, req.user.id, dto);
  }
}
