import { IsArray, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ResolveVacancyOutcomeDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['HIRED_CANDIDATE', 'EXTERNAL_HIRED', 'CANCELLED', 'EXTEND_TTL'], {
    message: 'Outcome harus salah satu dari: HIRED_CANDIDATE, EXTERNAL_HIRED, CANCELLED, EXTEND_TTL',
  })
  outcome: 'HIRED_CANDIDATE' | 'EXTERNAL_HIRED' | 'CANCELLED' | 'EXTEND_TTL';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  selectedTalentIds?: string[];

  @IsOptional()
  @IsString()
  notes?: string;
}
