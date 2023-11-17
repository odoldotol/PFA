import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.PG_HOST || '127.0.0.1',
  port: 5432,
  username: process.env.PG_USERNAME || 'test',
  password: process.env.PG_PASSWORD || 'test',
  database: process.env.PG_DATABASE || 'test',
  synchronize: false,
  entities: ['src/database/*/*.entity.ts'],
  migrations: ['migrations/postgres/*.ts'],
  migrationsTableName: 'migrations',
});
