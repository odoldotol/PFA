// import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ManagerController } from './manager.controller';
import { ManagerService } from './manager.service';
import { MarketModule } from '../market/market.module';
import { MongodbModule } from '../database/mongodb/mongodb.module';
import { UpdaterModule } from '../updater/updater.module';

@Module({
    imports: [
        UpdaterModule,
        MarketModule,
        // HttpModule.register({
        //     timeout: 90000,
        // }),
        MongodbModule
    ],
    controllers: [ManagerController],
    providers: [ManagerService]
})
export class ManagerModule {}