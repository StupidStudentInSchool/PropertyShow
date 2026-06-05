import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('hash_chain')
export class HashChain {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', name: 'prev_hash' })
  prevHash: string;

  @Column({ type: 'text', name: 'current_hash' })
  currentHash: string;

  @Column({ type: 'int', name: 'ledger_entry_id' })
  ledgerEntryId: number;

  @Column({ type: 'int', name: 'chain_index' })
  chainIndex: number;

  @Column({ type: 'datetime', name: 'block_time' })
  blockTime: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}