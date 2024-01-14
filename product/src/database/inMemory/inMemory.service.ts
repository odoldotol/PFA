// 필요 없어진거아님?

import { Inject, Injectable } from "@nestjs/common";
import {
  INMEMORY_STORE_SERVICE_TOKEN,
  INMEMORY_STORE_BACKUP_SERVICE_TOKEN
} from "./const/injectionToken.const";
import {
  InMemoryBackupService,
  InMemoryStoreService
} from "./interface";

@Injectable()
export class InMemoryService {

  constructor(
    @Inject(INMEMORY_STORE_SERVICE_TOKEN) private readonly storeSrv: InMemoryStoreService,
    @Inject(INMEMORY_STORE_BACKUP_SERVICE_TOKEN) private readonly backupSrv: InMemoryBackupService
  ) {}

  // [DEV]
  public getAllKeys() {
    return this.storeSrv.getAllKeys();
  }

  // 필요 없어진거아님?
  public localFileCacheRecovery() {
    return this.backupSrv.localFileCacheRecovery();
  }

  // 필요 없어진거아님?
  public isUseingAppMemory() {
    return Object.getPrototypeOf(this.storeSrv).constructor.name === "AppMemoryService";
  }

}