import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { ProductImageEntity } from './product-image.entity';

@Entity({ name: 'products' })
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', length: 100 })
  name: string;

  @Index({ unique: true })
  @Column({ name: 'sku', length: 70 })
  sku: string;

  @Column({
    name: 'price',
    type: 'numeric',
    precision: 10,
    scale: 2,
  })
  price: number;

  @Column({
    name: 'cost',
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  cost?: number;

  @Column({
    name: 'stock',
    type: 'integer',
    nullable: true,
  })
  stock?: number;

  @Column({
    name: 'active',
    type: 'boolean',
    default: true,
  })
  active: boolean;

  @OneToMany
  (() => ProductImageEntity, img => img.productId)
  images: ProductImageEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
