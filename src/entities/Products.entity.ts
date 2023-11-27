import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Carts } from './Carts.entity';
import { Details } from './Details.entity';
import { Images } from './Images.entity';
import { Categories } from './Categories.entity';
import { Collections } from './Collections.entity';
import { Productsinorders } from './Productsinorders.entity';
import { Sizes } from './Sizes.entity';
import { Usersratingproducts } from './Usersratingproducts.entity';

@Entity('products')
export class Products {
  @PrimaryGeneratedColumn({ type: 'int', name: 'productId' })
  productId: number;

  @Column('varchar2', { name: 'name', nullable: true, length: 500 })
  name: string | null;

  @Column('clob', { name: 'description', nullable: true })
  description: string | null;

  @Column('timestamp', {
    name: 'createdAt',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column('int', {
    name: 'deleted',
    nullable: true,
    default: () => 0,
  })
  deleted: number | null;

  @OneToMany(() => Carts, (carts) => carts.product)
  carts: Carts[];

  @OneToMany(() => Details, (details) => details.product)
  details: Details[];

  @OneToMany(() => Images, (images) => images.product)
  images: Images[];

  @ManyToMany(() => Categories, (categories) => categories.products)
  categories: Categories[];

  @ManyToMany(() => Collections, (collections) => collections.products)
  collections: Collections[];

  @OneToMany(
    () => Productsinorders,
    (productsinorders) => productsinorders.product,
  )
  productsinorders: Productsinorders[];

  @OneToMany(() => Sizes, (sizes) => sizes.product)
  sizes: Sizes[];

  @OneToMany(
    () => Usersratingproducts,
    (usersratingproducts) => usersratingproducts.product,
  )
  usersratingproducts: Usersratingproducts[];
}
