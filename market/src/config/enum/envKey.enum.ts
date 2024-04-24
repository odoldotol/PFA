export enum AppEnvKey {
  PORT = 'PORT',
  DOCKER_ENV = 'RACK_ENV'
}

export enum MongodbEnvKey {
  DEV_ENV = 'MONGO_DEV_ENV',
  URL = 'MONGO_URL',
  NAME = 'MONGO_database',
  QUERY = 'MONGO_Query'
}

export enum ChildApiEnvKey {
  BASE_URL = 'CHILD_API_BASE_URL',
  TIMEOUT = 'CHILD_API_TIMEOUT',
  WORKERS = 'CHILD_WORKERS',
  CONCURRENCY = 'CHILD_CONCURRENCY',
}

export enum ProductApiEnvKey {
  BASE_URL = 'PRODUCT_API_BASE_URL',
  TIMEOUT = 'PRODUCT_API_TIMEOUT',
}

export enum TempEnvKey {
  KEY = 'TEMP_KEY',
}

export enum PostgresEnvKey {
  HOST = 'PG_HOST',
  USERNAME = 'PG_USERNAME',
  PASSWORD = 'PG_PASSWORD',
  DATABASE = 'PG_DATABASE',
}

export enum Pm2EnvKey {
  NAME = 'PM2_NAME',
  LISTEN_TIMEOUT = 'listen_timeout',
}

export enum ThrottleEnvKey {
  TTL_GLOBAL_SHORT = 'THROTTLE_TTL_GLOBAL_SHORT',
  LIMIT_GLOBAL_SHORT = 'THROTTLE_LIMIT_GLOBAL_SHORT',

  TTL_GLOBAL_LONG = 'THROTTLE_TTL_GLOBAL_LONG',
  LIMIT_GLOBAL_LONG = 'THROTTLE_LIMIT_GLOBAL_LONG',
}
