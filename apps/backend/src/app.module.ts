import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { CommonModule } from './common/common.module';
import { MailModule } from './mail/mail.module';
import { OtpModule } from './otp/otp.module';
import { AuthModule } from './auth/auth.module';
import { TalentModule } from './talent/talent.module';
import { EmployerModule } from './employer/employer.module';
import { VacancyModule } from './vacancy/vacancy.module';
import { MatchingModule } from './matching/matching.module';
import { TrainingModule } from './training/training.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { InstitutionModule } from './institution/institution.module';
import { MajorModule } from './major/major.module';
import { SkillModule } from './skill/skill.module';
import { AdminModule } from './admin/admin.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    CommonModule,
    MailModule,
    OtpModule,
    AuthModule,
    TalentModule,
    EmployerModule,
    VacancyModule,
    MatchingModule,
    TrainingModule,
    AnalyticsModule,
    InstitutionModule,
    MajorModule,
    SkillModule,
    AdminModule,
    AiModule,
  ],
})
export class AppModule {}

