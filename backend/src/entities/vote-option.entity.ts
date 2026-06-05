import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Vote } from './vote.entity';

@Entity('vote_options')
export class VoteOption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'vote_id' })
  voteId: number;

  @Column({ length: 200 })
  text: string;

  @Column({ type: 'int', default: 0 })
  votes: number;

  @ManyToOne(() => Vote, vote => vote.options)
  @JoinColumn({ name: 'vote_id' })
  vote: Vote;
}