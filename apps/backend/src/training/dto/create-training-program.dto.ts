import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { TrainingDeliveryMode, TrainingCategory } from '@prisma/client';

export class CreateTrainingProgramDto {
  @IsString()
  @IsNotEmpty({ message: 'Judul program pelatihan wajib diisi.' })
  title: string;

  @IsOptional()
  @IsString()
  providerName?: string;

  @IsEnum(TrainingDeliveryMode, { message: 'Mode pelatihan harus ONLINE, OFFLINE, atau HYBRID.' })
  deliveryMode: TrainingDeliveryMode;

  @IsEnum(TrainingCategory, { message: 'Kategori kejuruan pelatihan tidak valid.' })
  category: TrainingCategory;

  @IsString()
  @IsNotEmpty({ message: 'Deskripsi program wajib diisi.' })
  description: string;

  @IsOptional()
  @IsString()
  syllabus?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  quota?: number;

  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(100)
  passingGrade?: number;

  @IsArray()
  @IsNotEmpty({ message: 'Target keahlian yang dihadiahkan wajib ditentukan.' })
  targetSkills: { name: string; level: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT' }[];
}
