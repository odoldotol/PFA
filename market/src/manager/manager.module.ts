import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ManagerController } from './manager.controller';
import { ManagerService } from './manager.service';
import { YahoofinanceModule } from '../yahoofinance/yahoofinance.module';
import { MongodbModule } from '../mongodb/mongodb.module';
import { UpdaterModule } from '../updater/updater.module';

@Module({
    imports: [
        UpdaterModule,
        YahoofinanceModule,
        HttpModule,
        MongodbModule
    ],
    controllers: [ManagerController],
    providers: [ManagerService]
})
export class ManagerModule {}