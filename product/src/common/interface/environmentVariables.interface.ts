import { EnvKey } from "../enum/envKey.emun";

export interface EnvironmentVariables {
    [EnvKey.PORT]: number;

    // .env
    [EnvKey.MARKET_API_TIMEOUT]: number;
    [EnvKey.TEMP_KEY]: string;
    [EnvKey.MinThreshold_priceCache]: number;
    [EnvKey.KAKAO_CHATBOT_VERSION]: string;
    [EnvKey.KAKAO_CHATBOT_ID]: string;
    [EnvKey.PG_HOST]: string;
    [EnvKey.PG_USERNAME]: string;
    [EnvKey.PG_PASSWORD]: string;
    [EnvKey.PG_DATABASE]: string;

    // pm2
    [EnvKey.PM2_NAME]: string;
    [EnvKey.PM2_LISTEN_TIMEOUT]: number;

    // docker
    [EnvKey.DOCKER_MARKET_API_BASE_URL]: string;
    [EnvKey.DOCKER_REDIS_URL]: string;
    [EnvKey.DOCKER_ENV]: string;
}