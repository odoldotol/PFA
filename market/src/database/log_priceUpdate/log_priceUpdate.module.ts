import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Log_priceUpdate, Log_priceUpdateSchema } from "./log_priceUpdate.schema";
import { LogPriceUpdateService } from "./log_priceUpdate.service";

@Module({
    imports: [
      MongooseModule.forFeature([
        { name: Log_priceUpdate.name, schema: Log_priceUpdateSchema},
      ])
    ],
    providers: [LogPriceUpdateService],
    exports: [LogPriceUpdateService]
})
export class LogPriceUpdateModule {}