import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GovernanceController } from './governance.controller';
import { GovernanceService } from './governance.service';
import { Vote } from '../../entities/vote.entity';
import { VoteOption } from '../../entities/vote-option.entity';
import { VoteRecord } from '../../entities/vote-record.entity';
import { Inquiry } from '../../entities/inquiry.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vote, VoteOption, VoteRecord, Inquiry])],
  controllers: [GovernanceController],
  providers: [GovernanceService],
  exports: [GovernanceService],
})
export class GovernanceModule {}