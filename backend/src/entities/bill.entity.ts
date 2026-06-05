import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum BillStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE'
}

export enum BillType {
  PROPERTY_FEE = 'PROPERTY_FEE',
  PARKING_FEE = 'PARKING_FEE',
  WATER_FEE = 'WATER_FEE',
  ELECTRIC_FEE = 'ELECTRIC_FEE',
  OTHER = 'OTHER'
}

@Entity('bills')
export class Bill {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, name: 'owner_id' })
  ownerId: string;

  @Column({ length: 50, name: 'owner_name' })
  ownerName: string;

  @Column({ length: 20, name: 'house_number' })
  houseNumber: string;

  @Column({
    type: 'enum',
    enum: BillType
  })
  type: BillType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: BillStatus,
    default: BillStatus.UNPAID
  })
  status: BillStatus;

  @Column({ type: 'date', name: 'bill_month' })
  billMonth: Date;

  @Column({ type: 'date', nullable: true, name: 'paid_at' })
  paidAt: Date;

  @Column({ type: 'int', name: 'community_id' })
  communityId: number;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}