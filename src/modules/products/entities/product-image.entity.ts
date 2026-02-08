import {
    Entity,
    Column,
    CreateDateColumn,
    PrimaryGeneratedColumn,
    Index,
  } from 'typeorm';
  
  @Entity({ name: 'product_images' })
  export class ProductImageEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Index()
    @Column({ name: 'product_id', type: 'uuid' })
    productId: string;
  
    @Column({ name: 'url', type: 'text' })
    url: string;
  
    // ordem da imagem (0 = principal)
    @Column({ name: 'position', type: 'int', default: 0 })
    position: number;
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  }
  