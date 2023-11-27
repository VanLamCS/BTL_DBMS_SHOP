import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Carts } from './Carts.entity';
import { Usershaveorders } from './Usershaveorders.entity';
import { Usersratingproducts } from './Usersratingproducts.entity';

@Index('email', ['email'], { unique: true })
@Entity('users')
export class Users {
  @PrimaryGeneratedColumn({ type: 'int', name: 'userId' })
  userId: number;

  @Column('varchar2', { name: 'name', nullable: true, length: 255 })
  name: string | null;

  @Column('varchar2', {
    name: 'phone',
    nullable: true,
    length: 20,
  })
  phone: string | null;

  @Column('varchar2', { name: 'sex', nullable: true, length: 10 })
  sex: string | null;

  @Column('varchar2', {
    name: 'email',
    nullable: false,
    length: 100,
  })
  email: string;

  @Column('varchar2', { name: 'password', nullable: true })
  password: string | null;

  @Column('varchar2', { name: 'avatar', nullable: true })
  avatar: string | null;

  @Column('varchar2', { name: 'address', nullable: true })
  address: string | null;

  @Column('varchar2', {
    name: 'role',
    nullable: true,
    length: 10,
    default: () => "'customer'",
  })
  role: string;

  @Column('timestamp', {
    name: 'createdAt',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @OneToMany(() => Carts, (carts) => carts.user)
  carts: Carts[];

  @OneToMany(() => Usershaveorders, (usershaveorders) => usershaveorders.user)
  usershaveorders: Usershaveorders[];

  @OneToMany(
    () => Usersratingproducts,
    (usersratingproducts) => usersratingproducts.user,
  )
  usersratingproducts: Usersratingproducts[];
}
