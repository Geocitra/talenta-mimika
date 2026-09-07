import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { VacancyStatus } from '@prisma/client';

export class UpdateJobVacancyDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  taskDescription?: string;

  @IsOptional()
  @IsString()
  projectDuration?: string;

  @IsOptional()
  @IsArray()
  requiredSkills?: string[];

  @IsOptional()
  @IsString()
  minEducation?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  minExperienceYears?: number;

  @IsOptional()
  @IsBoolean()
  allowEquivalence?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  jobLocationLat?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  jobLocationLng?: number;

  @IsOptional()
  @IsEnum(VacancyStatus)
  status?: VacancyStatus;
}
