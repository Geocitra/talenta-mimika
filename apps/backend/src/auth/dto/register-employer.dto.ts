import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterEmployerDto {
  @IsEmail({}, { message: 'Format email tidak valid.' })
  @IsNotEmpty({ message: 'Email perusahaan wajib diisi.' })
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'Kata sandi minimal 8 karakter jika diisi.' })
  password?: string;

  @IsString()
  @IsNotEmpty({ message: 'Nama perusahaan wajib diisi.' })
  companyName: string;

  @IsString()
  @IsNotEmpty({ message: 'Nomor Induk Berusaha (NIB) wajib diisi.' })
  nib: string;
}
