import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { DataSource, DataSourceOptions } from 'typeorm';

config({ path: ".env.market" });

const getTlsOptions = () => ({
  ssl: {
    ca: readFileSync("aws-rds.pem")
  },
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  }
});

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env['PG_HOST'] || '127.0.0.1',
  port: 5432,
  username: process.env['PG_USERNAME'] || 'test',
  password: process.env['PG_PASSWORD'] || 'test',
  database: process.env['PG_DATABASE'] || 'test',
  synchronize: false,
  entities: ['src/database/*/*.entity.ts'],
  migrations: ['migrations/postgres/*.ts'],
  migrationsTableName: 'migrations',
};

if (process.env['RACK_ENV'] === 'production') Object.assign(dataSourceOptions, getTlsOptions());

export default new DataSource(dataSourceOptions);
