import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  VIEW = 'VIEW'
}

export enum AuditModule {
  COMMUNITY = 'COMMUNITY',
  LEDGER = 'LEDGER',
  VOTE = 'VOTE',
  INQUIRY = 'INQUIRY',
  DISCLOSURE = 'DISCLOSURE',
  AUTH = 'AUTH',
  SYSTEM = 'SYSTEM'
}

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: AuditAction
  })
  action: AuditAction;

  @Column({
    type: 'enum',
    enum: AuditModule
  })
  module: AuditModule;

  @Column({ length: 50, name: 'user_id' })
  userId: string;

  @Column({ length: 50, name: 'user_name' })
  userName: string;

  @Column({ type: 'int', nullable: true, name: 'target_id' })
  targetId: number;

  @Column({ length: 200, nullable: true, name: 'target_name' })
  targetName: string;

  @Column({ type: 'text', nullable: true })
  detail: string;

  @Column({ length: 50, nullable: true })
  ip: string;

  @Column({ length: 255, nullable: true })
  userAgent: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}