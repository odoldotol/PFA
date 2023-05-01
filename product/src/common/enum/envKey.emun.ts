export enum EnvKey {
    Port = 'PORT',
    
    // .env
    MarketApiTimeout = 'MARKET_API_TIMEOUT',
    TempKey = 'TEMP_KEY',
    MinThreshold_priceCache = 'PRICE_CACHE_COUNT',
    KakaoChatbotVersion = 'KAKAO_CHATBOT_VERSION',
    KakaoChatbotID = 'KAKAO_CHATBOT_ID',

    // pm2
    Pm2_name = 'PM2_NAME',
    PM2_listen_timeout = 'listen_timeout',

    // docker
    Docker_marketApiBaseUrl = 'MARKET_API_BASE_URL',
}