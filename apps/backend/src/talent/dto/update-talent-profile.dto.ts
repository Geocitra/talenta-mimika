import { IsArray, IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTalentProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsArray()
  education?: any[];

  @IsOptional()
  @IsArray()
  workExperience?: any[];

  @IsOptional()
  @IsArray()
  skills?: any[];

  @IsOptional()
  @IsArray()
  certifications?: any[];

  @IsOptional()
  socialDna?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
