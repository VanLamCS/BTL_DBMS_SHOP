import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DBService } from './db.service';
import { UserModule } from '../user/user.module';
import { User } from '../user/user.entity';
import { AuthModule } from '../auth/auth.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../auth/strategy/auth.strategy';

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
        entities: [User],
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    PassportModule
  ],
  providers: [DBService],
})
export class DBModule {}
