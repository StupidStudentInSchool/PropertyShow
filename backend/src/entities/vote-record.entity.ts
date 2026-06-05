import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Vote } from './vote.entity';

@Entity('vote_records')
export class VoteRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'vote_id' })
  voteId: number;

  @Column({ type: 'int', name: 'option_id' })
  optionId: number;

  @Column({ length: 50, name: 'voter_id' })
  voterId: string;

  @Column({ length: 50, name: 'voter_name' })
  voterName: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Vote, vote => vote.records)
  @JoinColumn({ name: 'vote_id' })
  vote: Vote;
}