import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { ProductShelvePivotEntity } from '../product_shelve_pivot/product_shelve_pivot.entity';

@Entity('product_shelve')
export class ProductShelveEntity {
  @PrimaryColumn('varchar', { length: 60 })
  uuid: string;

  @Column({ length: 500 })
  name: string;

  @Column({ length: 500 })
  description: string;

  @Column({ type: 'double' })
  capacity: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy?: string;

  @Column({ name: 'deleted_by', type: 'uuid', nullable: true })
  deletedBy?: string;

  @OneToMany(() => ProductShelvePivotEntity, (ps) => ps.shelve)
  productShelves: ProductShelvePivotEntity[];

  // [NEW] Property virtual untuk menampung jumlah item (tidak masuk database)
  totalItems?: number;
}
