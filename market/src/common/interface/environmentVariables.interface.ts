import { EnvKey } from "../enum/envKey.enum";

export interface EnvironmentVariables {
    [EnvKey.PORT]: number;

    // .env
    [EnvKey.MONGODB_NAME]: string;
    [EnvKey.MONGODB_URL]: string;
    [EnvKey.MONGODB_QUERY]: string;
    [EnvKey.CHILD_API_TIMEOUT]: number;
    [EnvKey.CHILD_WORKERS]: number;
    [EnvKey.CHILD_CONCURRENCY]: number;
    [EnvKey.PRODUCT_API_TIMEOUT]: number;
    [EnvKey.TEMP_KEY]: string;
    [EnvKey.PG_HOST]: string;
    [EnvKey.PG_USERNAME]: string;
    [EnvKey.PG_PASSWORD]: string;
    [EnvKey.PG_DATABASE]: string;

    // pm2
    [EnvKey.PM2_NAME]: string;
    [EnvKey.PM2_LISTEN_TIMEOUT]: number;

    // docker
    [EnvKey.DOCKER_CHILD_API_BASE_URL]: string;
    [EnvKey.DOCKER_PRODUCT_API_BASE_URL]: string;
    [EnvKey.DOCKER_ENV]: string;

    // load
    [EnvKey.MONGODB_URI]: string;

}