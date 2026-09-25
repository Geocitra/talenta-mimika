import { IsArray, IsBoolean, IsISO8601, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateTalentProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  birthPlace?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'Format tanggal lahir harus YYYY-MM-DD atau ISO8601.' })
  birthDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  domicile?: string;

  @IsOptional()
  @IsBoolean()
  isLocal?: boolean;

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

  @IsOptional()
  @IsString()
  lastUpdatedAt?: string;
}
