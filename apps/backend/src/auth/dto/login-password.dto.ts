import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Email atau NIK wajib diisi.' })
  identifier: string; // Bisa berupa email atau 16 digit NIK

  @IsString()
  @MinLength(8, { message: 'Kata sandi minimal 8 karakter.' })
  password: string;
}
