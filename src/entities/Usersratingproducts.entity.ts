import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Products } from './Products.entity';
import { Users } from './Users.entity';

@Index('userratingproducts_product_fk', ['productId'], {})
@Entity('usersratingproducts')
export class Usersratingproducts {
  @Column('int', { primary: true, name: 'userId' })
  userId: number;

  @Column('int', { primary: true, name: 'productId' })
  productId: number;

  @Column('date', {
    name: 'time',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  time: Date | null;

  @Column('varchar2', { name: 'comment', nullable: true })
  comment: string | null;

  @Column('int', { name: 'star', nullable: true })
  star: number | null;

  @ManyToOne(() => Products, (products) => products.usersratingproducts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'productId', referencedColumnName: 'productId' }])
  product: Products;

  @ManyToOne(() => Users, (users) => users.usersratingproducts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'userId' }])
  user: Users;
}
