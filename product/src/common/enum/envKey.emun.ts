export enum EnvKey {
  PORT = 'PORT',

  // .env
  MARKET_API_TIMEOUT = 'MARKET_API_TIMEOUT',
  TEMP_KEY = 'TEMP_KEY',
  MinThreshold_priceCache = 'PRICE_CACHE_COUNT',
  KAKAO_CHATBOT_VERSION = 'KAKAO_CHATBOT_VERSION',
  KAKAO_CHATBOT_ID = 'KAKAO_CHATBOT_ID',
  PG_HOST = 'PG_HOST',
  PG_USERNAME = 'PG_USERNAME',
  PG_PASSWORD = 'PG_PASSWORD',
  PG_DATABASE = 'PG_DATABASE',

  // pm2
  PM2_NAME = 'PM2_NAME',
  PM2_LISTEN_TIMEOUT = 'listen_timeout',

  // docker
  DOCKER_MARKET_API_BASE_URL = 'MARKET_API_BASE_URL',
  DOCKER_REDIS_URL = 'REDIS_URL',
  DOCKER_ENV = 'RACK_ENV',
}
