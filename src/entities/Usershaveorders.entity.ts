import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { Orders } from './Orders.entity';
import { Users } from './Users.entity';

@Index('userhaveorders_user_fk', ['userId'], {})
@Entity('usershaveorders')
export class Usershaveorders {
  @Column('int', { primary: true, name: 'orderId' })
  orderId: number;

  @Column('int', { name: 'userId', nullable: true })
  userId: number | null;

  @OneToOne(() => Orders, (orders) => orders.usershaveorders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'orderId', referencedColumnName: 'orderId' }])
  order: Orders;

  @ManyToOne(() => Users, (users) => users.usershaveorders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'userId', referencedColumnName: 'userId' }])
  user: Users;
}
