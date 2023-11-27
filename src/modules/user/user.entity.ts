import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('Users') // Specify the table name if different from class name
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column({ length: 255, nullable: false })
  name: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 10, nullable: true, default: null })
  sex: string | null;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 255, nullable: false })
  password: string;

  @Column({ length: 500, nullable: true })
  avatar: string | null;

  @Column({ length: 500, nullable: true })
  address: string | null;

  @Column({ length: 10, default: 'customer' })
  role: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
