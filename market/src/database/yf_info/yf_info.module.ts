import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Yf_info, Yf_infoSchema } from "./yf_info.schema";
import { Yf_infoService } from "./yf_info.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Yf_info.name, schema: Yf_infoSchema },
    ])
  ],
  providers: [Yf_infoService],
  exports: [Yf_infoService]
})
export class Yf_infoModule {}
