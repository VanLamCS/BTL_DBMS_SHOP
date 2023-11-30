import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DBService } from './db.service';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { Users } from 'src/entities/Users.entity';
import { Carts } from 'src/entities/Carts.entity';
import { Categories } from 'src/entities/Categories.entity';
import { Collections } from 'src/entities/Collections.entity';
import { Details } from 'src/entities/Details.entity';
import { Images } from 'src/entities/Images.entity';
import { Orders } from 'src/entities/Orders.entity';
import { Products } from 'src/entities/Products.entity';
import { Productsinorders } from 'src/entities/Productsinorders.entity';
import { Sizes } from 'src/entities/Sizes.entity';
import { Usershaveorders } from 'src/entities/Usershaveorders.entity';
import { Usersratingproducts } from 'src/entities/Usersratingproducts.entity';
import { ProductModule } from '../product/product.module';
import { OrderModule } from '../order/order.module';
import { CartModule } from '../cart/cart.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'oracle',
        host: configService.getOrThrow('HOST'),
        port: parseInt(configService.getOrThrow('DB_PORT')),
        username: configService.getOrThrow('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        serviceName: configService.getOrThrow('DB_SERVICE_NAME'),
        logging: true,
        entities: [
          Users,
          Carts,
          Categories,
          Collections,
          Details,
          Images,
          Orders,
          Products,
          Productsinorders,
          Sizes,
          Usershaveorders,
          Usersratingproducts,
        ],
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    ProductModule,
    OrderModule,
    CartModule,
    PassportModule,
  ],
  providers: [DBService],
})
export class DBModule {}
