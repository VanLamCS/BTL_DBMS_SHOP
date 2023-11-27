import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Orders } from './Orders.entity';
import { Products } from './Products.entity';

@Index('productinorder_order_fk', ['orderId'], {})
@Entity('productsinorders')
export class Productsinorders {
  @Column('int', { primary: true, name: 'productId' })
  productId: number;

  @Column('int', { primary: true, name: 'orderId' })
  orderId: number;

  @Column('varchar2', { primary: true, name: 'size', length: 10 })
  size: string;

  @Column('int', { name: 'quantity', nullable: true })
  quantity: number | null;

  @ManyToOne(() => Orders, (orders) => orders.productsinorders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'orderId', referencedColumnName: 'orderId' }])
  order: Orders;

  @ManyToOne(() => Products, (products) => products.productsinorders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'productId', referencedColumnName: 'productId' }])
  product: Products;
}
