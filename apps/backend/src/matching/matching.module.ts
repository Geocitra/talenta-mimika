import { Module } from '@nestjs/common';
import { MatchingEngineService } from './matching-engine.service';
import { MatchingController } from './matching.controller';

@Module({
  controllers: [MatchingController],
  providers: [MatchingEngineService],
  exports: [MatchingEngineService],
})
export class MatchingModule {}
