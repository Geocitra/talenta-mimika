import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ProgramApprovalStatus } from '@prisma/client';

export class CurateProgramDto {
  @IsEnum(ProgramApprovalStatus, { message: 'Status keputusan kurasi harus APPROVED atau REJECTED.' })
  @IsNotEmpty({ message: 'Status keputusan kurasi wajib ditentukan.' })
  status: ProgramApprovalStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
