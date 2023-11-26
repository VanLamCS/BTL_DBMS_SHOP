import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();

const configService = new ConfigService();

export default new DataSource({
  type: 'oracle',
  host: configService.getOrThrow('HOST'),
  port: parseInt(configService.getOrThrow('DB_PORT')),
  username: configService.getOrThrow('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  serviceName: configService.getOrThrow('DB_SERVICE_NAME'),
  entities: [`./src/modules/**/*.entity{.ts,.js}`],
  migrations: [`./src/migrations/**`],
  logging: true,
});
