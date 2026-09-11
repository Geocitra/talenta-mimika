import { IsOptional, IsString } from 'class-validator';

export class EnrollBatchDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
