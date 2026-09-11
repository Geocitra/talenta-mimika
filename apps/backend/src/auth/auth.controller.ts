import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterTalentDto } from './dto/register-talent.dto';
import { RegisterEmployerDto } from './dto/register-employer.dto';
import { RegisterTrainingProviderDto } from './dto/register-training-provider.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginPasswordDto } from './dto/login-password.dto';
import { SendLoginOtpDto } from './dto/send-login-otp.dto';
import { ResendRegistrationOtpDto } from './dto/resend-registration-otp.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { Response, Request } from 'express';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/talent')
  @HttpCode(HttpStatus.CREATED)
  async registerTalent(@Body() dto: RegisterTalentDto) {
    return this.authService.registerTalent(dto);
  }

  @Post('register/employer')
  @HttpCode(HttpStatus.CREATED)
  async registerEmployer(@Body() dto: RegisterEmployerDto) {
    return this.authService.registerEmployer(dto);
  }

  @Post('register/provider')
  @HttpCode(HttpStatus.CREATED)
  async registerTrainingProvider(@Body() dto: RegisterTrainingProviderDto) {
    return this.authService.registerTrainingProvider(dto);
  }

  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.verifyOtpAndLogin(dto, res);
  }

  @Post('otp/send-login')
  @HttpCode(HttpStatus.OK)
  async sendLoginOtp(@Body() dto: SendLoginOtpDto) {
    return this.authService.sendLoginOtp(dto.identifier);
  }

  @Post('otp/resend-registration')
  @HttpCode(HttpStatus.OK)
  async resendRegistrationOtp(@Body() dto: ResendRegistrationOtpDto) {
    return this.authService.resendRegistrationOtp(dto.email);
  }

  @Post('login/password')
  @HttpCode(HttpStatus.OK)
  async loginWithPassword(
    @Body() dto: LoginPasswordDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.loginWithPassword(dto, res);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }

  // Endpoint Terlindungi (Wajib Memiliki Cookie Sesi Aktif)
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req: Request) {
    return {
      status: 'success',
      data: req.user,
    };
  }
}
