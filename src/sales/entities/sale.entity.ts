import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { SaleItemEntity } from './sale-item.entity';

export enum SaleStatus {
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED',
  CANCELED = 'CANCELED',
}

@Entity('sales')
export class SalesEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'enum', enum: SaleStatus, default: SaleStatus.DRAFT })
  status!: SaleStatus;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  total!: string;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @OneToMany(() => SaleItemEntity, (item) => item.sale, { cascade: false })
  items!: SaleItemEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
