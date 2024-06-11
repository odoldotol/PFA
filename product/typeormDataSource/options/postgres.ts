import { config } from 'dotenv';
import { readFileSync } from 'fs';
import * as path from 'path';
import { DataSourceOptions } from 'typeorm';

const rootPath = path.join(__dirname, "..", "..");
const envPath = path.join(rootPath, ".env.product");
const rdsKeyPath = path.join(rootPath, "aws-rds.pem");

config({ path: envPath });

const getTlsOptions = () => ({
  ssl: {
    ca: readFileSync(rdsKeyPath)
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
  port:  process.env['RACK_ENV'] === undefined ? 5433 : 5432,
  username: process.env['PG_USERNAME'] || 'test',
  password: process.env['PG_PASSWORD'] || 'test',
  database: process.env['PG_DATABASE'] || 'test',
  synchronize: false,
  entities: ['src/database/*/*.entity.ts'],
  migrations: ['src/migrations/postgres/*.ts'],
  migrationsTableName: 'migrations',
};

if (process.env['RACK_ENV'] === 'production') {
  Object.assign(dataSourceOptions, getTlsOptions());
}

export default dataSourceOptions;
