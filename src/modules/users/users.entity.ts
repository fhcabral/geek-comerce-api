import { Exclude } from 'class-transformer';
import {
  Entity, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn,
  PrimaryGeneratedColumn, Index
} from 'typeorm';

@Entity({ name: 'users' })
export class UsersEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', length: 100 })
  name: string;

  @Index({ unique: true })
  @Column({ name: 'email', length: 70 })
  email: string;

  @Exclude()
  @Column({ name: 'password', length: 255, select: false })
  password: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
