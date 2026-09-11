import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { InstitutionType } from '@prisma/client';

export class RegisterTrainingProviderDto {
  @IsEmail({}, { message: 'Format email tidak valid.' })
  @IsNotEmpty({ message: 'Email lembaga pelatihan wajib diisi.' })
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Kata sandi minimal 8 karakter jika diisi.' })
  password?: string;

  @IsString()
  @IsNotEmpty({ message: 'Nama resmi lembaga (LPK / BLK / LSP) wajib diisi.' })
  institutionName: string;

  @IsOptional()
  @IsEnum(InstitutionType, { message: 'Tipe lembaga pelatihan tidak valid.' })
  institutionType?: InstitutionType;

  @IsOptional()
  @IsString()
  vinNumber?: string;

  @IsOptional()
  @IsString()
  bnspLicenseNumber?: string;

  @IsString()
  @IsNotEmpty({ message: 'Nama penanggung jawab / PIC wajib diisi.' })
  picName: string;

  @IsOptional()
  @IsString()
  picRole?: string;

  @IsString()
  @IsNotEmpty({ message: 'Nomor telepon / WhatsApp PIC wajib diisi.' })
  picPhone: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  locationLat?: number;

  @IsOptional()
  @IsNumber()
  locationLng?: number;
}
