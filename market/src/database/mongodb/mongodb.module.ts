import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseOptionsService } from './mongooseOptions.service';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useClass: MongooseOptionsService,
    }),
  ],
})
export class MongodbModule {}
