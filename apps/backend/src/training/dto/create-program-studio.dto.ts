import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TrainingCategory, CertificateType, TrainingDeliveryMode } from '@prisma/client';

export class TargetSkillItemDto {
  @IsString()
  @IsNotEmpty({ message: 'Nama keahlian wajib diisi.' })
  name: string;

  @IsEnum(['BEGINNER', 'INTERMEDIATE', 'EXPERT'], {
    message: 'Tingkat keahlian harus BEGINNER, INTERMEDIATE, atau EXPERT.',
  })
  level: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT';
}

export class CreateProgramStudioDto {
  @IsString()
  @IsNotEmpty({ message: 'Judul program pelatihan/sertifikasi wajib diisi.' })
  title: string;

  @IsEnum(TrainingCategory, { message: 'Kategori kejuruan pelatihan tidak valid.' })
  category: TrainingCategory;

  @IsOptional()
  @IsString()
  subCategory?: string;

  @IsEnum(CertificateType, { message: 'Tipe sertifikat yang diterbitkan tidak valid.' })
  certificateType: CertificateType;

  @IsEnum(TrainingDeliveryMode, { message: 'Mode pelaksanaan harus OFFLINE, ONLINE, atau HYBRID.' })
  deliveryMode: TrainingDeliveryMode;

  @IsString()
  @IsNotEmpty({ message: 'Deskripsi program wajib diisi.' })
  description: string;

  @IsOptional()
  @IsString()
  syllabus?: string;

  @IsOptional()
  @IsArray()
  requirements?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TargetSkillItemDto)
  targetSkills: TargetSkillItemDto[];

  @IsOptional()
  @IsInt()
  @Min(1)
  durationDays?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  totalLessonHours?: number;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @IsOptional()
  @IsBoolean()
  submitForApproval?: boolean;
}
