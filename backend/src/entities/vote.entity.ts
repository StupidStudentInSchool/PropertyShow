import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { VoteOption } from './vote-option.entity';
import { VoteRecord } from './vote-record.entity';

export enum VoteStatus {
  ONGOING = 'ONGOING',
  ENDED = 'ENDED'
}

@Entity('votes')
export class Vote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: VoteStatus,
    default: VoteStatus.ONGOING
  })
  status: VoteStatus;

  @Column({ type: 'date', name: 'start_date' })
  startDate: Date;

  @Column({ type: 'date', name: 'end_date' })
  endDate: Date;

  @Column({ type: 'int', name: 'community_id' })
  communityId: number;

  @Column({ length: 50, name: 'created_by' })
  createdBy: string;

  @Column({ type: 'boolean', default: false, name: 'is_anonymous' })
  isAnonymous: boolean;

  @Column({ type: 'int', default: 0, name: 'total_votes' })
  totalVotes: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => VoteOption, option => option.vote, { cascade: true })
  options: VoteOption[];

  @OneToMany(() => VoteRecord, record => record.vote)
  records: VoteRecord[];
}