import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Products } from './Products.entity';

@Index('size_product_fk', ['productId'], {})
@Entity('sizes')
export class Sizes {
  @Column('varchar2', { primary: true, name: 'sizeName', length: 10 })
  sizeName: string;

  @Column('int', { primary: true, name: 'quantity' })
  quantity: number;

  @Column('int', { primary: true, name: 'productId' })
  productId: number;

  @Column('float', { primary: true, name: 'price', precision: 12 })
  price: number;

  @ManyToOne(() => Products, (products) => products.sizes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'productId', referencedColumnName: 'productId' }])
  product: Products;
}
