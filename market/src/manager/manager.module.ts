import { Module } from '@nestjs/common';
import { ManagerController } from './manager.controller';
import { ManagerService } from './manager.service';
import { UpdaterModule } from '../updater/updater.module';
import { DBModule } from '../database/database.module';

@Module({
    imports: [
        UpdaterModule,
        DBModule,
    ],
    controllers: [ManagerController],
    providers: [ManagerService]
})
export class ManagerModule {}