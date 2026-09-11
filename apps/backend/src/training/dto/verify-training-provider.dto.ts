import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { VerificationStatus } from '@prisma/client';

export class VerifyTrainingProviderDto {
  @IsEnum(VerificationStatus, { message: 'Status verifikasi harus APPROVED atau REJECTED.' })
  @IsNotEmpty({ message: 'Status verifikasi wajib ditentukan.' })
  status: VerificationStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
