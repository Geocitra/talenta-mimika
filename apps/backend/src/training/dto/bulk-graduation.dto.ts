import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BatchGraduationParticipantItemDto {
  @IsUUID('4', { message: 'ID talenta harus berformat UUID v4.' })
  @IsNotEmpty({ message: 'ID talenta wajib diisi.' })
  talentId: string;

  @IsBoolean({ message: 'Status kelulusan harus bernilai boolean (true/false).' })
  isPassed: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  finalScore?: number;

  @IsOptional()
  @IsString()
  certificateNumber?: string;

  @IsOptional()
  @IsString()
  bnspCertificateNumber?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class BulkGraduationDto {
  @IsOptional()
  @IsString()
  certificatePrefix?: string;

  @IsOptional()
  @IsBoolean()
  autoNumbering?: boolean;

  @IsArray({ message: 'Daftar peserta kelulusan harus berupa array.' })
  @ValidateNested({ each: true })
  @Type(() => BatchGraduationParticipantItemDto)
  participants: BatchGraduationParticipantItemDto[];
}
