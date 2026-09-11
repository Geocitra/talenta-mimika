import { Module } from '@nestjs/common';
import { MatchingEngineService } from './matching-engine.service';
import { MatchingController } from './matching.controller';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [MatchingController],
  providers: [MatchingEngineService],
  exports: [MatchingEngineService],
})
export class MatchingModule {}
