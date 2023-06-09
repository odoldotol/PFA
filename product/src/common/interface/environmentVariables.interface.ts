import { EnvKey } from "../enum/envKey.emun";

export interface EnvironmentVariables {
    [EnvKey.Port]: number;

    // .env
    [EnvKey.MarketApiTimeout]: number;
    [EnvKey.TempKey]: string;
    [EnvKey.MinThreshold_priceCache]: number;
    [EnvKey.KakaoChatbotVersion]: string;
    [EnvKey.KakaoChatbotID]: string;

    // pm2
    [EnvKey.Pm2_name]: string;
    [EnvKey.PM2_listen_timeout]: number;

    // docker
    [EnvKey.Docker_marketApiBaseUrl]: string;
    [EnvKey.Docker_redisUrl]: string;
}