import { Module } from "@nestjs/common";
import { AssetController } from "./asset.controller";
import { AssetService } from "./asset.service";

@Module({
  imports: [],
  controllers: [AssetController],
  providers: [AssetService],
})
export class AssetModule {}
