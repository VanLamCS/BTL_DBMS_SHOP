import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Productsinorders } from './Productsinorders.entity';
import { Usershaveorders } from './Usershaveorders.entity';

@Entity('orders')
export class Orders {
  @PrimaryGeneratedColumn({ type: 'int', name: 'orderId' })
  orderId: number;

  @Column('varchar2', {
    name: 'status',
    nullable: true,
    length: 20,
    default: () => "'Pending'",
    comment: `CHECK (status IN ('Pending', 'Accepted', 'Shipping', 'Done', 'Canceled'))`,
  })
  status: 'Pending' | 'Accepted' | 'Shipping' | 'Done' | 'Canceled' | null;

  @Column('varchar2', { name: 'phone', nullable: true, length: 20 })
  phone: string | null;

  @Column('float', { name: 'cost', nullable: true, precision: 12 })
  cost: number | null;

  @Column('varchar2', { name: 'note', nullable: true, length: 255 })
  note: string | null;

  @Column('varchar2', { name: 'address', nullable: true })
  address: string | null;

  @Column('int', { name: 'paid', default: () => 0 })
  paid: number;

  @Column('varchar2', {
    name: 'paymentMethod',
    nullable: true,
    length: 50,
    default: () => "'Cash'",
  })
  paymentMethod: string | null;

  @Column('date', { name: 'paymentDate', nullable: true })
  paymentDate: Date | null;

  @Column('date', { name: 'orderTime', default: () => 'CURRENT_TIMESTAMP' })
  orderTime: Date;

  @Column('date', { name: 'deliveryTime', nullable: true })
  deliveryTime: Date | null;

  @OneToMany(
    () => Productsinorders,
    (productsinorders) => productsinorders.order,
  )
  productsinorders: Productsinorders[];

  @OneToOne(() => Usershaveorders, (usershaveorders) => usershaveorders.order)
  usershaveorders: Usershaveorders;
}
