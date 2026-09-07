import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashService {
  private readonly SALT_ROUNDS_PASSWORD = 10;
  private readonly SALT_ROUNDS_OTP = 8; // Lebih cepat untuk data sementara (transient)

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS_PASSWORD);
  }

  async comparePassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  async hashOtp(otp: string): Promise<string> {
    return bcrypt.hash(otp, this.SALT_ROUNDS_OTP);
  }

  async compareOtp(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
