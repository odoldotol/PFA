import { Injectable } from "@nestjs/common";
import { AppMemoryService } from "./appMemory/appMemory.service";
import { BackupService } from "./appMemory/backup.service";

@Injectable()
export class InMemoryService {

    constructor(
        private readonly storeSrv: AppMemoryService,
        private readonly backupSrv: BackupService
    ) {}

    // [DEV]
    getAllKeys = this.storeSrv.getAllKeys;

    localFileCacheRecovery = this.backupSrv.localFileCacheRecovery;

}