import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class InMemoryService {

    constructor(
        @Inject("INMEMORY_STORE_SERVICE") private readonly storeSrv: InMemoryStoreServiceI,
        @Inject("INMEMORY_STORE_BACKUP_SERVICE") private readonly backupSrv: InMemoryStoreBackupServiceI
    ) {}

    // [DEV]
    getAllKeys = this.storeSrv.getAllKeys;

    localFileCacheRecovery = this.backupSrv.localFileCacheRecovery;

}