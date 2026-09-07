import { IsNotEmpty, IsString } from 'class-validator';

export class SendLoginOtpDto {
  @IsString()
  @IsNotEmpty({ message: 'Email atau NIK wajib diisi.' })
  identifier: string;
}
