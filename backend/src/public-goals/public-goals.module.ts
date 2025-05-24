import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicGoalsController } from './public-goals.controller';
import { PublicGoalsService } from './public-goals.service';
import { Goal } from '../goals/goal.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Goal]), AuthModule],
  controllers: [PublicGoalsController],
  providers: [PublicGoalsService],
  exports: [PublicGoalsService],
})
export class PublicGoalsModule {}
