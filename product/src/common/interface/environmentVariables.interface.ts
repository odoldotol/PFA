import { EnvKey } from "../enum/envKey.emun";

export interface EnvironmentVariables {
    [EnvKey.PORT]: number;

    // .env
    [EnvKey.PG_HOST]: string;
    [EnvKey.PG_USERNAME]: string;
    [EnvKey.PG_PASSWORD]: string;
    [EnvKey.PG_DATABASE]: string;

    [EnvKey.MARKET_API_TIMEOUT]: number;
    [EnvKey.TEMP_KEY]: string;

    [EnvKey.MinThreshold_priceCache]: number;

    [EnvKey.KAKAO_CHATBOT_ID]: string;

    [EnvKey.KAKAO_CHATBOT_BLOCK_ID_INQUIRE_ASSET]: string;
    [EnvKey.KAKAO_CHATBOT_BLOCK_ID_REPORT]: string;
    [EnvKey.KAKAO_CHATBOT_BLOCK_ID_SUBSCRIBE_ASSET]: string;
    [EnvKey.KAKAO_CHATBOT_BLOCK_ID_CANCEL_ASSET_SUBSCRIPTION]: string;

    // pm2
    [EnvKey.PM2_NAME]: string;
    [EnvKey.PM2_LISTEN_TIMEOUT]: number;

    // docker
    [EnvKey.DOCKER_MARKET_API_BASE_URL]: string;
    [EnvKey.DOCKER_REDIS_URL]: string;
    [EnvKey.DOCKER_ENV]: string;
}