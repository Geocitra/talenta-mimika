import { Module } from '@nestjs/common';
import { TrainingService } from './training.service';
import { TrainingController } from './training.controller';
import { TrainingProviderService } from './training-provider.service';
import { TrainingProviderController } from './training-provider.controller';
import { TrainingAdminService } from './training-admin.service';
import { TrainingAdminController } from './training-admin.controller';
import { BatchGraduationService } from './services/batch-graduation.service';

@Module({
  controllers: [
    TrainingController,
    TrainingProviderController,
    TrainingAdminController,
  ],
  providers: [
    TrainingService,
    TrainingProviderService,
    TrainingAdminService,
    BatchGraduationService,
  ],
  exports: [
    TrainingService,
    TrainingProviderService,
    TrainingAdminService,
    BatchGraduationService,
  ],
})
export class TrainingModule {}


