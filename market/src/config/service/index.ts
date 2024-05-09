import { isType } from 'src/common/util';

export * from './app.service';
export * from './childApi.service';
export * from './mongodb.service';
export * from './pm2.service';
export * from './postgres.service';
export * from './productApi.service';
export * from './temp.service';
export * from './exchange.service';

export const serviceArr = Object.values(module.exports).filter(isType);