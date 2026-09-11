import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { InstitutionType } from '@prisma/client';

export class UpdateTrainingProviderProfileDto {
  @IsOptional()
  @IsString()
  institutionName?: string;

  @IsOptional()
  @IsEnum(InstitutionType, { message: 'Tipe lembaga pelatihan tidak valid.' })
  institutionType?: InstitutionType;

  @IsOptional()
  @IsString()
  vinNumber?: string;

  @IsOptional()
  @IsString()
  bnspLicenseNumber?: string;

  @IsOptional()
  @IsString()
  accreditation?: string;

  @IsOptional()
  @IsString()
  picName?: string;

  @IsOptional()
  @IsString()
  picRole?: string;

  @IsOptional()
  @IsString()
  picPhone?: string;

  @IsOptional()
  @IsString()
  picEmail?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  locationLat?: number;

  @IsOptional()
  @IsNumber()
  locationLng?: number;

  @IsOptional()
  @IsString()
  institutionBio?: string;

  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  legalDocUrl?: string;
}
