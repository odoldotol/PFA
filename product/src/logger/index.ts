import { ConsoleLogger } from './console';
import { SilentLogger } from './silentLogger';

const isTestEnvironment = process.env["NODE_ENV"] === 'test' || process.env["JEST_WORKER_ID"] !== undefined;

export * from './logger.module';
export * from './loggable';

export const DefaultLogger = isTestEnvironment ? SilentLogger : ConsoleLogger;