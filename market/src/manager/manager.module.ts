import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ManagerController } from './manager.controller';
import { ManagerService } from './manager.service';
import { YahoofinanceModule } from 'src/yahoofinance/yahoofinance.module';
import { MongodbModule } from 'src/mongodb/mongodb.module';

@Module({
    imports: [
        YahoofinanceModule,
        HttpModule,
        MongodbModule
    ],
    controllers: [ManagerController],
    providers: [ManagerService]
})
export class ManagerModule {}