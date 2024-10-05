import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MongodbConfigService } from "src/config";

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async (
        mongodbConfigSrv: MongodbConfigService
      ) => ({
        uri: mongodbConfigSrv.getAtlasUri(),
      }),
      inject: [MongodbConfigService],
    }),
  ],
})
export class MongodbModule {}