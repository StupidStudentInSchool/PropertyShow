import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Community } from './community.entity';

export enum EntryType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export enum EntryCategory {
  PROPERTY_FEE = 'PROPERTY_FEE',
  PARKING_FEE = 'PARKING_FEE',
  ADVERTISING = 'ADVERTISING',
  STAFF_SALARY = 'STAFF_SALARY',
  CLEANING = 'CLEANING',
  SECURITY = 'SECURITY',
  MAINTENANCE = 'MAINTENANCE',
  UTILITIES = 'UTILITIES',
  OTHER = 'OTHER'
}

@Entity('ledger_entries')
export class LedgerEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: EntryType
  })
  type: EntryType;

  @Column({
    type: 'enum',
    enum: EntryCategory
  })
  category: EntryCategory;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ length: 255 })
  counterparty: string;

  @Column({ type: 'date', name: 'occurred_at' })
  occurredAt: Date;

  @Column({ length: 500, nullable: true })
  description: string;

  @Column({ length: 255, nullable: true, name: 'evidence_url' })
  evidenceUrl: string;

  @Column({ name: 'community_id' })
  communityId: number;

  @Column({ length: 50, name: 'created_by' })
  createdBy: string;

  @Column({ type: 'text', nullable: true, name: 'hash_value' })
  hashValue: string;

  @Column({ type: 'boolean', default: false, name: 'is_verified' })
  isVerified: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Community, community => community.ledgerEntries)
  @JoinColumn({ name: 'community_id' })
  community: Community;
}