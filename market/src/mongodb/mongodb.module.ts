import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Yf_info, Yf_infoSchema } from './schema/yf_info.schema';
import { Status_price, Status_priceSchema } from './schema/status_price.schema';
import { Log_priceUpdate, Log_priceUpdateSchema } from './schema/log_priceUpdate.schema';
import { Config_exchange, Config_exchangeSchema } from './schema/config_exchange.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Yf_info.name, schema: Yf_infoSchema },
            { name: Status_price.name, schema: Status_priceSchema},
            { name: Log_priceUpdate.name, schema: Log_priceUpdateSchema},
            { name: Config_exchange.name, schema: Config_exchangeSchema}
        ])
    ],
    exports: [MongooseModule]
})
export class MongodbModule {}
