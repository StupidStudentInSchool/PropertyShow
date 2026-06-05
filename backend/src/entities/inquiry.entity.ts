import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum InquiryStatus {
  PENDING = 'PENDING',
  REPLIED = 'REPLIED',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED'
}

@Entity('inquiries')
export class Inquiry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ length: 50, name: 'author_id' })
  authorId: string;

  @Column({ length: 50, name: 'author_name' })
  authorName: string;

  @Column({
    type: 'enum',
    enum: InquiryStatus,
    default: InquiryStatus.PENDING
  })
  status: InquiryStatus;

  @Column({ type: 'text', nullable: true, name: 'reply_content' })
  replyContent: string;

  @Column({ type: 'datetime', nullable: true, name: 'replied_at' })
  repliedAt: Date;

  @Column({ length: 50, nullable: true, name: 'replied_by' })
  repliedBy: string;

  @Column({ type: 'datetime', nullable: true, name: 'closed_at' })
  closedAt: Date;

  @Column({ type: 'int', name: 'community_id' })
  communityId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}