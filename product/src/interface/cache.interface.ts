type CacheKey = string

type CacheValue = MarketDate | CachedPrice

type CacheSet = [CacheKey, CacheValue, number?]