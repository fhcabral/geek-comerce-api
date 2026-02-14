import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum PaymentMethod {
  PIX = 'PIX',
  CASH = 'CASH',
  CARD = 'CARD',
  TRANSFER = 'TRANSFER',
}

export enum PaymentStatus {
  PAID = 'PAID',
  CANCELED = 'CANCELED',
}

@Entity('payments')
export class PaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'sale_id', type: 'uuid' })
  saleId!: string;

  @Column({ type: 'enum', enum: PaymentMethod })
  method!: PaymentMethod;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  amount!: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PAID })
  status!: PaymentStatus;

  @Column({ type: 'timestamptz', nullable: true })
  paidAt?: Date | null;

  @CreateDateColumn()
  createdAt!: Date;
}
