import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicGoalsController } from './public-goals.controller';
import { PublicGoalsService } from './public-goals.service';
import { Goal } from '../goals/goal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Goal])],
  controllers: [PublicGoalsController],
  providers: [PublicGoalsService],
  exports: [PublicGoalsService],
})
export class PublicGoalsModule {}
