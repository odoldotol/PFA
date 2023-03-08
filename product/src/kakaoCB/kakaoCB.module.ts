import { Module } from "@nestjs/common";
import { KakaoCBController } from "./kakaoCB.controller";
import { KakaoCBService } from "./kakaoCB.service";
import { MarketModule } from "../market/market.module";
import { DBModule } from "../database/database.module";

@Module({
    imports: [
        MarketModule,
        DBModule
    ],
    controllers: [KakaoCBController],
    providers: [KakaoCBService]
})
export class KakaoCBModule {}