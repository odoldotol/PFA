import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Yf_info, Yf_infoSchema } from "./yf_info.schema";
import { YfinanceInfoService } from "./yf_info.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Yf_info.name, schema: Yf_infoSchema },
    ])
  ],
  providers: [YfinanceInfoService],
  exports: [YfinanceInfoService]
})
export class YfinanceInfoModule {}
