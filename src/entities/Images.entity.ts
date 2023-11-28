import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Products } from './Products.entity';

@Entity('images')
export class Images {
  @Column('int', { primary: true, name: 'productId' })
  productId: number;

  @Column('varchar2', { primary: true, name: 'imageLink', length: 1200 })
  imageLink: string;

  @ManyToOne(() => Products, (products) => products.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn([{ name: 'productId', referencedColumnName: 'productId' }])
  product: Products;
}
