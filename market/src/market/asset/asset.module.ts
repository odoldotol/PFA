import { Module } from "@nestjs/common";
import { ChildApiModule } from "../child_api/child_api.module";
import { ExchangeModule } from "../exchange/exchange.module";
import { AssetService } from "./asset.service";

@Module({
  imports: [
    ChildApiModule,
    ExchangeModule
  ],
  providers: [AssetService],
  exports: [AssetService]
})
export class AssetModule {}
