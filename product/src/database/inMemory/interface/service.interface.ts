export interface InMemoryBackupService {
  localFileCacheRecovery: (fileName?: string) => Promise<void>;
}

export interface InMemoryStoreService {
  getAllKeys(prefix?: string): Promise<string[]>;
}