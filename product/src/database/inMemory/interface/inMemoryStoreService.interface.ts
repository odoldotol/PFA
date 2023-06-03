interface InMemoryStoreServiceI {
    getAllKeys(): Promise<string[]>;
    setCache<T>(cacheSet: CacheSet<T>): Promise<T>;
    deleteCache(key: string): Promise<boolean>;
    getValue(key: string): Promise<any>;
}