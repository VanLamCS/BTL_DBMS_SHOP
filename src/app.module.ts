import { Module } from '@nestjs/common';
import { DBModule } from './modules/db/db.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DBModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
