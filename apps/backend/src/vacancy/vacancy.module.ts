import { Module } from '@nestjs/common';
import { VacancyService } from './vacancy.service';
import { VacancyAssistantService } from './vacancy-assistant.service';
import { VacancyController } from './vacancy.controller';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [VacancyController],
  providers: [VacancyService, VacancyAssistantService],
  exports: [VacancyService, VacancyAssistantService],
})
export class VacancyModule {}
