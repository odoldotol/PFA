import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Yf_info, Yf_infoSchema } from '../schema/yf_info.schema';
import { ManagerController } from './manager.controller';
import { ManagerService } from './manager.service';

@Module({
    imports: [
        HttpModule,
        MongooseModule.forFeature([{ name: Yf_info.name, schema: Yf_infoSchema }])
    ],
    controllers: [ManagerController],
    providers: [
        ManagerService
    ]
})
export class ManagerModule {}