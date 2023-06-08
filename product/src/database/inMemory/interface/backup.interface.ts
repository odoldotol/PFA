interface InMemoryStoreBackupServiceI {
    localFileCacheRecovery: (fileName?: string) => Promise<void>;
}