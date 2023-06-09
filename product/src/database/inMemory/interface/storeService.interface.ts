interface InMemoryStoreServiceI {
    getAllKeys(): Promise<string[]>;
}