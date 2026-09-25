import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Email atau NIK wajib diisi.' })
  identifier: string; // Bisa berupa email atau 16 digit NIK

  @IsString()
  @MinLength(6, { message: 'Kata sandi minimal 6 karakter.' })
  password: string;
}
