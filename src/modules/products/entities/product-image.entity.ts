import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ProductEntity } from "./products.entity";

@Entity({ name: "product_images" })
export class ProductImageEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column({ name: "product_id", type: "uuid" })
  productId: string;

  @ManyToOne(() => ProductEntity, (p) => p.images, { onDelete: "CASCADE" })
  @JoinColumn({ name: "product_id" })
  product: ProductEntity;

  @Column({ name: "url", type: "text" })
  url: string;

  @Column({ name: "path", type: "text", nullable: true })
  path: string;

  @Column({ name: "position", type: "int", default: 0 })
  position: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}