import {
  AppEnvKey,
  DockerEnv,
  FinancialAssetEnvKey,
  KakaoChatbotEnvKey,
  MarketApiEnvKey,
  OpenAIEnvKey,
  Pm2EnvKey,
  PostgresEnvKey,
  RedisEnvKey,
  TempEnvKey,
  ThrottleEnvKey,
} from "../enum";

export interface EnvironmentVariables
  extends
  AppEnvironmentVariables,
  FinancialAssetEnvironmentVariables,
  KakaoChatbotEnvironmentVariables,
  MarketApiEnvironmentVariables,
  Pm2EnvironmentVariables,
  PostgresEnvironmentVariables,
  RedisEnviromentVariables,
  TempEnvironmentVariables,
  ThrottleEnvironmentVariables,
  OpenAIEnvironmentVariables
{}

export interface AppEnvironmentVariables {
  [AppEnvKey.PORT]: number;
  [AppEnvKey.DOCKER_ENV]: DockerEnv;
  [AppEnvKey.MAINTENANCE]: "0" | "1";
}

export interface KakaoChatbotEnvironmentVariables {
  [KakaoChatbotEnvKey.ID]: string;
  [KakaoChatbotEnvKey.BLOCK_ID_INQUIRE_ASSET]: string;
  [KakaoChatbotEnvKey.BLOCK_ID_REPORT]: string;
  [KakaoChatbotEnvKey.BLOCK_ID_SUBSCRIBE_ASSET]: string;
  [KakaoChatbotEnvKey.BLOCK_ID_CANCEL_ASSET_SUBSCRIPTION]: string;
  [KakaoChatbotEnvKey.BLOCK_ID_INQUIRE_SUBSCRIBED_ASSET]: string;
  [KakaoChatbotEnvKey.BLOCK_ID_INQUIRE_ASSET_NO_INPUT]: string;
  [KakaoChatbotEnvKey.BLOCK_ID_HELP]: string;
  [KakaoChatbotEnvKey.BLOCK_ID_INTRODUCE]: string;
  [KakaoChatbotEnvKey.BLOCK_ID_SPONSOR]: string;

  [KakaoChatbotEnvKey.ID_STOREBOT_ORDER]: string;
  [KakaoChatbotEnvKey.BLOCK_ID_SCHEDULE_LAUNCH_ALARM]: string;

  // survey test
  [KakaoChatbotEnvKey.ID_STOREBOT]: string;
  [KakaoChatbotEnvKey.BLOCK_ID_SURVEY_START]: string;
  [KakaoChatbotEnvKey.BLOCK_ID_SURVEY_ANSWER]: string;
  [KakaoChatbotEnvKey.BLOCK_ID_SURVEY_GET_EVENT_SERIAL]: string;

  [KakaoChatbotEnvKey.URL_TAEYCOFFEROASTERS_COOKIES_IMAGE]: string;
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

export interface FinancialAssetEnvironmentVariables {
  [FinancialAssetEnvKey.RENEWAL_THRESHOLD]: number;
}

export interface ThrottleEnvironmentVariables {
  [ThrottleEnvKey.TTL_GLOBAL_SHORT]: number;
  [ThrottleEnvKey.LIMIT_GLOBAL_SHORT]: number;

  [ThrottleEnvKey.TTL_GLOBAL_MEDIUM]: number;
  [ThrottleEnvKey.LIMIT_GLOBAL_MEDIUM]: number;

  [ThrottleEnvKey.TTL_GLOBAL_LONG]: number;
  [ThrottleEnvKey.LIMIT_GLOBAL_LONG]: number;

  [ThrottleEnvKey.TTL_GLOBAL_CUT]: number;
  [ThrottleEnvKey.LIMIT_GLOBAL_CUT]: number;

  [ThrottleEnvKey.TTL_KAKAO_CHATBOT_SHORT]: number;
  [ThrottleEnvKey.LIMIT_KAKAO_CHATBOT_SHORT]: number;

  [ThrottleEnvKey.TTL_KAKAO_CHATBOT_LONG]: number;
  [ThrottleEnvKey.LIMIT_KAKAO_CHATBOT_LONG]: number;
}

export interface OpenAIEnvironmentVariables {
  [OpenAIEnvKey.API_KEY]: string;
}
