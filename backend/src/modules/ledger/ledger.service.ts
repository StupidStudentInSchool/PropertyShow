import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as CryptoJS from 'crypto-js';
import { LedgerEntry, EntryType, EntryCategory } from '../../entities/ledger-entry.entity';
import { HashChain } from '../../entities/hash-chain.entity';

export interface CreateLedgerEntryDto {
  type: EntryType;
  category: EntryCategory;
  amount: number;
  counterparty: string;
  occurredAt: Date;
  description?: string;
  evidenceUrl?: string;
  communityId: number;
  createdBy: string;
}

export interface UpdateLedgerEntryDto {
  type?: EntryType;
  category?: EntryCategory;
  amount?: number;
  counterparty?: string;
  occurredAt?: Date;
  description?: string;
  evidenceUrl?: string;
}

@Injectable()
export class LedgerService {
  constructor(
    @InjectRepository(LedgerEntry)
    private ledgerRepository: Repository<LedgerEntry>,
    @InjectRepository(HashChain)
    private hashChainRepository: Repository<HashChain>,
  ) {}

  async findAll(communityId?: number): Promise<LedgerEntry[]> {
    const query = this.ledgerRepository.createQueryBuilder('entry')
      .orderBy('entry.occurredAt', 'DESC');
    
    if (communityId) {
      query.where('entry.communityId = :communityId', { communityId });
    }
    
    return query.getMany();
  }

  async findOne(id: number): Promise<LedgerEntry> {
    const entry = await this.ledgerRepository.findOneBy({ id });
    if (!entry) {
      throw new NotFoundException(`台账记录 ${id} 不存在`);
    }
    return entry;
  }

  async create(dto: CreateLedgerEntryDto): Promise<LedgerEntry> {
    const entry = this.ledgerRepository.create(dto);
    
    const prevChain = await this.hashChainRepository.findOne({
      order: { chainIndex: 'DESC' }
    });
    
    const prevHash = prevChain?.currentHash || '0';
    const currentHash = this.generateHash(prevHash, dto);
    
    entry.hashValue = currentHash;
    
    const savedEntry = await this.ledgerRepository.save(entry);
    
    await this.hashChainRepository.save({
      prevHash,
      currentHash,
      ledgerEntryId: savedEntry.id,
      chainIndex: prevChain ? prevChain.chainIndex + 1 : 0,
      blockTime: new Date()
    });
    
    return savedEntry;
  }

  async update(id: number, dto: UpdateLedgerEntryDto): Promise<LedgerEntry> {
    const entry = await this.findOne(id);
    Object.assign(entry, dto);
    return this.ledgerRepository.save(entry);
  }

  async delete(id: number): Promise<void> {
    const result = await this.ledgerRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`台账记录 ${id} 不存在`);
    }
  }

  async getStatistics(communityId?: number): Promise<any> {
    const query = this.ledgerRepository.createQueryBuilder('entry');
    
    if (communityId) {
      query.where('entry.communityId = :communityId', { communityId });
    }
    
    const [income, expense] = await Promise.all([
      query.clone().select('SUM(entry.amount)', 'total').where('entry.type = :type', { type: EntryType.INCOME }).getRawOne(),
      query.clone().select('SUM(entry.amount)', 'total').where('entry.type = :type', { type: EntryType.EXPENSE }).getRawOne(),
    ]);
    
    return {
      totalIncome: income?.total || 0,
      totalExpense: expense?.total || 0,
      balance: (income?.total || 0) - (expense?.total || 0),
    };
  }

  async getRecentEntries(limit: number = 10, communityId?: number): Promise<LedgerEntry[]> {
    const query = this.ledgerRepository.createQueryBuilder('entry')
      .orderBy('entry.createdAt', 'DESC')
      .limit(limit);
    
    if (communityId) {
      query.where('entry.communityId = :communityId', { communityId });
    }
    
    return query.getMany();
  }

  private generateHash(prevHash: string, dto: CreateLedgerEntryDto): string {
    const data = JSON.stringify({
      prevHash,
      type: dto.type,
      category: dto.category,
      amount: dto.amount,
      counterparty: dto.counterparty,
      occurredAt: dto.occurredAt,
      timestamp: Date.now(),
    });
    return CryptoJS.SHA256(data).toString();
  }
}