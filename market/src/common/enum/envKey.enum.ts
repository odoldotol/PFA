export enum EnvKey {
    Port = 'PORT',
    
    // .env
    MongoDB_name = 'MONGO_database',
    MongoDB_url = 'MONGO_URL',
    MongoDB_query = 'MONGO_Query',
    ChildApiTimeout = 'CHILD_API_TIMEOUT',
    Child_concurrency = 'CHILD_CONCURRENCY',
    ProductApiTimeout = 'PRODUCT_API_TIMEOUT',
    TempKey = 'TEMP_KEY',
    PgHost = 'PG_HOST',
    PgUsername = 'PG_USERNAME',
    PgPassword = 'PG_PASSWORD',
    PgDatabase = 'PG_DATABASE',

    // pm2
    Pm2_name = 'PM2_NAME',
    PM2_listen_timeout = 'listen_timeout',

    // docker
    Docker_childApiBaseUrl = 'CHILD_API_BASE_URL',
    Docker_productApiBaseUrl = 'PRODUCT_API_BASE_URL',
    Docker_env = 'RACK_ENV',

    // load
    MONGODB_URI = 'MONGODB_URI',
    TYPEORM_MODULE_OPTIONS = 'TYPEORM_MODULE_OPTIONS'
}