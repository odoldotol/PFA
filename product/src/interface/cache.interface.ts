type CacheKey = string

type CacheValue = MarketDate | CachedPrice

type CacheSet<T> = [CacheKey, T, number?]