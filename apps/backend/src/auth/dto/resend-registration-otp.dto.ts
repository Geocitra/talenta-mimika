import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendRegistrationOtpDto {
  @IsEmail({}, { message: 'Format email tidak valid.' })
  @IsNotEmpty({ message: 'Email wajib diisi.' })
  email: string;
}
