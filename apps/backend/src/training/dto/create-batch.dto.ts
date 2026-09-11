import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ProgramFundingType, TrainingMethod } from '@prisma/client';

export class CreateBatchDto {
  @IsString()
  @IsNotEmpty({ message: 'Nama batch / gelombang wajib diisi.' })
  batchName: string;

  @IsEnum(ProgramFundingType, { message: 'Skema pembiayaan tidak valid.' })
  fundingType: ProgramFundingType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  priceAmount?: number;

  @IsEnum(TrainingMethod, { message: 'Metode akomodasi harus BOARDING, NON_BOARDING, atau MTU.' })
  trainingMethod: TrainingMethod;

  @IsInt()
  @Min(1, { message: 'Kuota kursi minimal 1 orang.' })
  quota: number;

  @IsOptional()
  @IsArray()
  welfareBenefits?: string[];

  @IsDateString({}, { message: 'Format tanggal mulai pendaftaran harus YYYY-MM-DD.' })
  @IsNotEmpty()
  registrationStart: string;

  @IsDateString({}, { message: 'Format tanggal selesai pendaftaran harus YYYY-MM-DD.' })
  @IsNotEmpty()
  registrationEnd: string;

  @IsDateString({}, { message: 'Format tanggal mulai pelatihan harus YYYY-MM-DD.' })
  @IsNotEmpty()
  trainingStart: string;

  @IsDateString({}, { message: 'Format tanggal selesai pelatihan harus YYYY-MM-DD.' })
  @IsNotEmpty()
  trainingEnd: string;

  @IsOptional()
  @IsString()
  venueAddress?: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  venueLat?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  venueLng?: number;
}

export class UpdateBatchDto {
  @IsOptional()
  @IsString()
  batchName?: string;

  @IsOptional()
  @IsEnum(ProgramFundingType, { message: 'Skema pembiayaan tidak valid.' })
  fundingType?: ProgramFundingType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  priceAmount?: number;

  @IsOptional()
  @IsEnum(TrainingMethod, { message: 'Metode akomodasi harus BOARDING, NON_BOARDING, atau MTU.' })
  trainingMethod?: TrainingMethod;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Kuota kursi minimal 1 orang.' })
  quota?: number;

  @IsOptional()
  @IsArray()
  welfareBenefits?: string[];

  @IsOptional()
  @IsDateString({}, { message: 'Format tanggal mulai pendaftaran harus YYYY-MM-DD.' })
  registrationStart?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Format tanggal selesai pendaftaran harus YYYY-MM-DD.' })
  registrationEnd?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Format tanggal mulai pelatihan harus YYYY-MM-DD.' })
  trainingStart?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Format tanggal selesai pelatihan harus YYYY-MM-DD.' })
  trainingEnd?: string;

  @IsOptional()
  @IsString()
  venueAddress?: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  venueLat?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  venueLng?: number;

  @IsOptional()
  @IsBoolean()
  isOpen?: boolean;
}
