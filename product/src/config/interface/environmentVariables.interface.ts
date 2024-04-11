import {
  AssetEnvKey,
  AppEnvKey,
  DockerEnv,
  KakaoChatbotEnvKey,
  MarketApiEnvKey,
  Pm2EnvKey,
  PostgresEnvKey,
  RedisEnvKey,
  TempEnvKey,
} from "../enum";

export interface EnvironmentVariables
  extends
  AppEnvironmentVariables,
  AssetEnvironmentVariables,
  KakaoChatbotEnvironmentVariables,
  MarketApiEnvironmentVariables,
  Pm2EnvironmentVariables,
  PostgresEnvironmentVariables,
  RedisEnviromentVariables,
  TempEnvironmentVariables
{}

export interface AppEnvironmentVariables {
  [AppEnvKey.PORT]: number;
  [AppEnvKey.DOCKER_ENV]: DockerEnv;
}

export interface KakaoChatbotEnvironmentVariables {
  [KakaoChatbotEnvKey.ID]: string;
  [KakaoChatbotEnvKey.BLOCK_ID_INQUIRE_ASSET]: string;
  [KakaoChatbotEnvKey.BLOCK_ID_REPORT]: string;
  [KakaoChatbotEnvKey.BLOCK_ID_SUBSCRIBE_ASSET]: string;
  [KakaoChatbotEnvKey.BLOCK_ID_CANCEL_ASSET_SUBSCRIPTION]: string;
}

export interface MarketApiEnvironmentVariables {
  [MarketApiEnvKey.BASE_URL]: string;
  [MarketApiEnvKey.TIMEOUT]: number;
}

export interface Pm2EnvironmentVariables {
  [Pm2EnvKey.NAME]: string;
  [Pm2EnvKey.LISTEN_TIMEOUT]: number;
}

export interface PostgresEnvironmentVariables {
  [PostgresEnvKey.HOST]: string;
  [PostgresEnvKey.USERNAME]: string;
  [PostgresEnvKey.PASSWORD]: string;
  [PostgresEnvKey.DATABASE]: string;
}

export interface RedisEnviromentVariables {
  [RedisEnvKey.URL]: string;
}

export interface TempEnvironmentVariables {
  [TempEnvKey.KEY]: string;
}

export interface AssetEnvironmentVariables {
  [AssetEnvKey.THRESHOLD_PRICE_COUNT]: number;
}