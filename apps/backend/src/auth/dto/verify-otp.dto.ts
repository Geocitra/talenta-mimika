import { IsEmail, IsEnum, IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { OtpPurpose } from '@prisma/client';

export class VerifyOtpDto {
  @IsEmail({}, { message: 'Format email tidak valid.' })
  @IsNotEmpty({ message: 'Email wajib diisi.' })
  email: string;

  @IsString()
  @Length(6, 6, { message: 'Kode OTP harus tepat 6 digit angka.' })
  @Matches(/^[0-9]+$/, { message: 'Kode OTP hanya boleh berisi angka.' })
  otpCode: string;

  @IsEnum(OtpPurpose, { message: 'Tujuan OTP harus REGISTRATION atau LOGIN.' })
  @IsNotEmpty({ message: 'Tujuan OTP wajib disertakan.' })
  purpose: OtpPurpose;
}
