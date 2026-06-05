import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { LedgerEntry } from './ledger-entry.entity';

export enum CommunityStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

@Entity('communities')
export class Community {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255 })
  address: string;

  @Column({ length: 20, nullable: true })
  contactPhone: string;

  @Column({ type: 'int', default: 0 })
  totalHouseholds: number;

  @Column({ type: 'int', default: 0 })
  registeredHouseholds: number;

  @Column({
    type: 'enum',
    enum: CommunityStatus,
    default: CommunityStatus.ACTIVE
  })
  status: CommunityStatus;

  @Column({ length: 255, nullable: true })
  logoUrl: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => LedgerEntry, entry => entry.community)
  ledgerEntries: LedgerEntry[];
}