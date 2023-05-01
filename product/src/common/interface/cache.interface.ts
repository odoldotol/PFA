type CacheKey = ISO_Code_priceStatus | TickerSymbol

type CacheValue = MarketDateI | CachedPriceI

type CacheSet<T> = [CacheKey, T, number?]
// type CacheSet2<T> = [CacheKey, T, number]

type CacheUpdateSet<T> = [CacheKey, Partial<T>]

type BackupCacheValue = string | CachedPriceI

type ISO_Code_priceStatus = string // Todo: ISO_Code_priceStatus 정의 - "ISO_Code" + "_priceStatus"