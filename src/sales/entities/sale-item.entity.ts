import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SalesEntity } from './sale.entity';

@Entity('sale_items')
@Index(['saleId', 'productId'], { unique: true })
export class SaleItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid' })
  saleId!: string;

  @Index()
  @Column({ type: 'uuid' })
  productId!: string;

  @Column({ type: 'varchar', length: 255 })
  nameSnapshot!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  skuSnapshot?: string | null;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  unitPriceSnapshot!: string;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  lineTotal!: string;

  @ManyToOne(() => SalesEntity, (sale) => sale.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'saleId' })
  sale!: SalesEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
