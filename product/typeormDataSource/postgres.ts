import { DataSource } from 'typeorm';
import dataSourceOptions from './options/postgres';

export default new DataSource(dataSourceOptions);
