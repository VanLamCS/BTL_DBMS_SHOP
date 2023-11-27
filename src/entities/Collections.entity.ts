import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Products } from './Products.entity';

@Entity('collections')
export class Collections {
  @PrimaryGeneratedColumn({ type: 'int', name: 'collectionId' })
  collectionId: number;

  @Column('varchar2', { name: 'name', nullable: true, length: 500 })
  name: string | null;

  @Column('clob', { name: 'description', nullable: true })
  description: string | null;

  @ManyToMany(() => Products, (products) => products.collections)
  @JoinTable({
    name: 'productsincollections',
    joinColumns: [
      { name: 'collectionId', referencedColumnName: 'collectionId' },
    ],
    inverseJoinColumns: [
      { name: 'productId', referencedColumnName: 'productId' },
    ],
  })
  products: Products[];
}
