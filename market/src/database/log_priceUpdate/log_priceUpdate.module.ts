import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Log_priceUpdate, Log_priceUpdateSchema } from "./log_priceUpdate.schema";
import { Log_priceUpdateService } from "./log_priceUpdate.service";

@Module({
    imports: [
      MongooseModule.forFeature([
        { name: Log_priceUpdate.name, schema: Log_priceUpdateSchema},
      ])
    ],
    providers: [Log_priceUpdateService],
    exports: [Log_priceUpdateService]
})
export class Log_priceUpdateModule {}