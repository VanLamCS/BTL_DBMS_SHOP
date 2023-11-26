import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('Users') // Specify the table name if different from class name
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column({ length: 255, nullable: false })
  name: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 10, nullable: true, default: null })
  sex: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 255, nullable: false })
  password: string;

  @Column({ length: 500, nullable: true })
  avatar: string;

  @Column({ length: 500, nullable: true })
  address: string;

  @Column({ length: 10, default: 'customer' })
  role: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
