import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LedgerController } from './ledger.controller';
import { LedgerService } from './ledger.service';
import { LedgerEntry } from '../../entities/ledger-entry.entity';
import { HashChain } from '../../entities/hash-chain.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LedgerEntry, HashChain])],
  controllers: [LedgerController],
  providers: [LedgerService],
  exports: [LedgerService],
})
export class LedgerModule {}