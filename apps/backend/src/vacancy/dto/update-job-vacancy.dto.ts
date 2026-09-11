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
import { VacancyStatus, OpportunityType, WorkZone, WorkSchedule, EmploymentContractType } from '@prisma/client';

export class UpdateJobVacancyDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  taskDescription?: string;

  @IsOptional()
  @IsEnum(EmploymentContractType, { message: 'Tipe kontrak kerja tidak valid.' })
  contractType?: EmploymentContractType;

  @IsOptional()
  @IsInt({ message: 'Durasi kontrak bulan harus berupa bilangan bulat.' })
  @Min(1, { message: 'Durasi kontrak minimal 1 bulan.' })
  contractDurationMonths?: number;

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
  @IsEnum(OpportunityType)
  opportunityType?: OpportunityType;

  @IsOptional()
  @IsInt()
  @Min(1)
  quota?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salaryMax?: number;

  @IsOptional()
  @IsBoolean()
  isSalaryDisclosed?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stipendAmount?: number;

  @IsOptional()
  @IsArray()
  benefits?: string[];

  @IsOptional()
  @IsArray()
  workTools?: string[];

  @IsOptional()
  @IsBoolean()
  isSameAsOfficeLocation?: boolean;

  @IsOptional()
  @IsEnum(WorkZone)
  workZone?: WorkZone;

  @IsOptional()
  @IsEnum(WorkSchedule)
  workSchedule?: WorkSchedule;

  @IsOptional()
  @IsArray()
  skillsGained?: string[];

  @IsOptional()
  @IsString()
  mentorName?: string;

  @IsOptional()
  @IsString()
  mentorRole?: string;

  @IsOptional()
  @IsBoolean()
  hasAbsorptionOpportunity?: boolean;

  @IsOptional()
  @IsArray()
  mandatoryCerts?: string[];

  @IsOptional()
  @IsArray()
  preferredMajors?: string[];

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
