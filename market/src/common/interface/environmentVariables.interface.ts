import { EnvKey } from "../enum/envKey.emun";

export interface EnvironmentVariables {
    [EnvKey.Port]: number;

    // .env
    [EnvKey.MongoDB_name]: string;
    [EnvKey.MongoDB_url]: string;
    [EnvKey.MongoDB_query]: string;
    [EnvKey.ChildApiTimeout]: number;
    [EnvKey.Child_concurrency]: number;
    [EnvKey.ProductApiTimeout]: number;
    [EnvKey.TempKey]: string;
    [EnvKey.Yf_update_margin_ms_default]: number;
    [EnvKey.Yf_CCC_Code]: string;

    // pm2
    [EnvKey.Pm2_name]: string;
    [EnvKey.PM2_listen_timeout]: number;

    // docker
    [EnvKey.Docker_childApiBaseUrl]: string;
    [EnvKey.Docker_productApiBaseUrl]: string;
    [EnvKey.Docker_env]: string;

}