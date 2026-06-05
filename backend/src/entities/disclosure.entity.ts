import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum DisclosureType {
  FINANCIAL = 'FINANCIAL',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  NOTICE = 'NOTICE',
  DOCUMENT = 'DOCUMENT'
}

export enum DisclosureStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED'
}

@Entity('disclosures')
export class Disclosure {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({
    type: 'enum',
    enum: DisclosureType
  })
  type: DisclosureType;

  @Column({
    type: 'enum',
    enum: DisclosureStatus,
    default: DisclosureStatus.DRAFT
  })
  status: DisclosureStatus;

  @Column({ type: 'int', name: 'community_id' })
  communityId: number;

  @Column({ length: 50, name: 'created_by' })
  createdBy: string;

  @Column({ type: 'datetime', nullable: true, name: 'published_at' })
  publishedAt: Date;

  @Column({ type: 'datetime', nullable: true, name: 'scheduled_at' })
  scheduledAt: Date;

  @Column({ type: 'boolean', default: false, name: 'is_pinned' })
  isPinned: boolean;

  @Column({ type: 'int', default: 0, name: 'view_count' })
  viewCount: number;

  @Column({ type: 'simple-array', nullable: true, name: 'attachment_urls' })
  attachmentUrls: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}