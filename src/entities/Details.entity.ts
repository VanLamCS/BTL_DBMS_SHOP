import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Products } from './Products.entity';

@Index('detail_product_fk', ['productId'], {})
@Entity('details')
export class Details {
  @Column('varchar2', { primary: true, name: 'sizeName', length: 10 })
  sizeName: string;

  @Column('int', { primary: true, name: 'quantity' })
  quantity: number;

  @Column('int', { primary: true, name: 'productId' })
  productId: number;

  @ManyToOne(() => Products, (products) => products.details, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'productId', referencedColumnName: 'productId' }])
  product: Products;
}
