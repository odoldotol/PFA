interface InMemoryStoreService {
    getAllKeys(): Promise<string[]>;
    setCache<T>(cacheSet: CacheSet<T>): Promise<T>;
    deleteCache(key: string): Promise<any>;
    getValue(key: string): Promise<any>;
}