interface InMemoryStoreServiceI {
    getAllKeys(prefix?: string): Promise<string[]>;
}