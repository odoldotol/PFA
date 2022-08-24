import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Yf_info, Yf_infoSchema } from 'src/schema/yf_info.schema';
import { UpdaterController } from './updater.controller';
import { UpdaterService } from './updater.service';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([{ name: Yf_info.name, schema: Yf_infoSchema }])
],
  controllers: [UpdaterController],
  providers: [UpdaterService]
})
export class UpdaterModule {}
