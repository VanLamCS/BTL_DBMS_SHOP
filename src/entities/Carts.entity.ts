import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Products } from './Products.entity';
import { Users } from './Users.entity';

@Index('cart_user_fk', ['userId'], {})
@Index('cart_product_fk', ['productId'], {})
@Entity('carts')
export class Carts {
  @PrimaryGeneratedColumn({ type: 'int', name: 'cartId' })
  cartId: number;

  @Column('int', { name: 'productId', nullable: true })
  productId: number | null;

  @Column('int', { name: 'userId' })
  userId: number;

  @Column('varchar2', { name: 'size', nullable: true, length: 10 })
  size: string | null;

  @Column('int', { name: 'quantity', nullable: true, default: () => "'1'" })
  quantity: number | null;

  @Column('date', {
    name: 'time',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  time: Date | null;

  @ManyToOne(() => Products, (products) => products.carts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'productId', referencedColumnName: 'productId' }])
  product: Products;

  @ManyToOne(() => Users, (users) => users.carts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'userId' }])
  user: Users;
}
