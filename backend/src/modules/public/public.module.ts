import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { Community } from '../../entities/community.entity';
import { LedgerEntry } from '../../entities/ledger-entry.entity';
import { Vote } from '../../entities/vote.entity';
import { Inquiry } from '../../entities/inquiry.entity';
import { Disclosure } from '../../entities/disclosure.entity';
import { ServiceRecord } from '../../entities/service-record.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Community, LedgerEntry, Vote, Inquiry, Disclosure, ServiceRecord]),
  ],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
