import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config as dotenvConfig } from 'dotenv';
import { join } from 'path';

// garante .env carregado quando rodar via CLI
dotenvConfig({ path: join(process.cwd(), '.env') });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,

  // IMPORTANTE: CLI precisa de paths, não autoLoadEntities
  entities: [join(__dirname, '..', '..', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],

  synchronize: false,
  logging: false,
});
