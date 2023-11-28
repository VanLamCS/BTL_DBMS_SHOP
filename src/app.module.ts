import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DBModule } from './modules/db/db.module';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { CustomExceptionFilter } from './filters/custom-filter';
import { AdditionalExceptionMiddleware } from './middlewares/typeorm-error.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DBModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: CustomExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AdditionalExceptionMiddleware).forRoutes('*');
  }
}
