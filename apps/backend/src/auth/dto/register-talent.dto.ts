import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  IsISO8601,
  MinLength,
} from 'class-validator';

export class RegisterTalentDto {
  @IsEmail({}, { message: 'Format email tidak valid.' })
  @IsNotEmpty({ message: 'Email wajib diisi.' })
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Kata sandi minimal 8 karakter jika diisi.' })
  password?: string;

  @IsString()
  @IsNotEmpty({ message: 'Nama lengkap wajib diisi.' })
  fullName: string;

  @IsString()
  @Length(16, 16, { message: 'NIK harus tepat 16 digit angka.' })
  @Matches(/^[0-9]+$/, { message: 'NIK hanya boleh berisi angka.' })
  nik: string;

  @IsISO8601({}, { message: 'Format tanggal lahir harus YYYY-MM-DD.' })
  @IsNotEmpty({ message: 'Tanggal lahir wajib diisi.' })
  birthDate: string;
}
