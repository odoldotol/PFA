import { isType } from 'src/common/util';

export * from './app.service';
export * from './asset.service';
export * from './kakaoChatbot.service';
export * from './marketApi.service';
export * from './pm2.service';
export * from './postgres.service';
export * from './redis.service';
export * from './temp.service';

export const serviceArr = Object.values(module.exports).filter(isType);