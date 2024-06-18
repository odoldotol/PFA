import {
  AppEnvKey,
  ChildApiEnvKey,
  DockerEnv,
  MongodbEnvKey,
  MongoDevEnv,
  Pm2EnvKey,
  PostgresEnvKey,
  PriceRequestStrategy,
  ProductApiEnvKey,
  TempEnvKey,
} from "../enum";

export interface EnvironmentVariables
  extends
  AppEnvironmentVariables,
  MongodbEnvironmentVariables,
  ChildApiEnvironmentVariables,
  TempEnvironmentVariables,
  PostgresEnvironmentVariables,
  Pm2EnvironmentVariables
{}

export interface AppEnvironmentVariables {
  [AppEnvKey.PORT]: number;
  [AppEnvKey.DOCKER_ENV]: DockerEnv;
}

export interface MongodbEnvironmentVariables {
  [MongodbEnvKey.DEV_ENV]: MongoDevEnv;
  [MongodbEnvKey.URL]: string;
  [MongodbEnvKey.NAME]: string;
  [MongodbEnvKey.QUERY]: string;
}

export interface ChildApiEnvironmentVariables {
  [ChildApiEnvKey.BASE_URL]: string;
  [ChildApiEnvKey.TIMEOUT]: number;
  [ChildApiEnvKey.WORKERS]: number;
  [ChildApiEnvKey.CONCURRENCY]: number;
  [ChildApiEnvKey.THREADPOOL_WORKERS]: number;
  [ChildApiEnvKey.PRICE_REQUEST_STRATEGY]: PriceRequestStrategy;
}

export interface ProductApiEnvironmentVariables {
  [ProductApiEnvKey.BASE_URL]: string;
  [ProductApiEnvKey.TIMEOUT]: number;
}

export interface TempEnvironmentVariables {
  [TempEnvKey.KEY]: string;
}

export interface PostgresEnvironmentVariables {
  [PostgresEnvKey.HOST]: string;
  [PostgresEnvKey.USERNAME]: string;
  [PostgresEnvKey.PASSWORD]: string;
  [PostgresEnvKey.DATABASE]: string;
}

export interface Pm2EnvironmentVariables {
  [Pm2EnvKey.NAME]: string;
  [Pm2EnvKey.LISTEN_TIMEOUT]: number;
}
