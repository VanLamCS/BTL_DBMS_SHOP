import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Products } from './Products.entity';

@Index('name', ['name'], { unique: true })
@Entity('categories')
export class Categories {
  @PrimaryGeneratedColumn({ type: 'int', name: 'categoryId' })
  categoryId: number;

  @Column('varchar2', {
    name: 'name',
    nullable: false,
    length: 500,
  })
  name: string;

  @Column('clob', { name: 'description', nullable: true })
  description: string | null;

  @ManyToMany(() => Products, (products) => products.categories)
  @JoinTable({
    name: 'productsincategories',
    joinColumns: [{ name: 'categoryId', referencedColumnName: 'categoryId' }],
    inverseJoinColumns: [
      { name: 'productId', referencedColumnName: 'productId' },
    ],
  })
  products: Products[];
}
