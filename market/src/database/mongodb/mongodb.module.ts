import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Yf_info, Yf_infoSchema } from './schema/yf_info.schema';
import { Status_price, Status_priceSchema } from './schema/status_price.schema';
import { Log_priceUpdate, Log_priceUpdateSchema } from './schema/log_priceUpdate.schema';
import { Config_exchange, Config_exchangeSchema } from './schema/config_exchange.schema';
import { Exchange_updateSet, Exchange_updateSetSchema } from './schema/exchange_updateSet.schema';
import { Yf_infoRepository } from './repository/yf-info.repository';
import { Status_priceRepository } from './repository/status_price.repository';
import { Log_priceUpdateRepository } from './repository/log_priceUpdate.repository';
import { Config_exchangeRepository } from './repository/config_exchane.repository';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Yf_info.name, schema: Yf_infoSchema },
            { name: Status_price.name, schema: Status_priceSchema},
            { name: Log_priceUpdate.name, schema: Log_priceUpdateSchema},
            { name: Config_exchange.name, schema: Config_exchangeSchema},
            { name: Exchange_updateSet.name, schema: Exchange_updateSetSchema}
        ])
    ],
    providers: [
        Yf_infoRepository,
        Status_priceRepository,
        Log_priceUpdateRepository,
        Config_exchangeRepository
    ],
    exports: [
        Yf_infoRepository,
        Status_priceRepository,
        Log_priceUpdateRepository,
        Config_exchangeRepository
    ]
})
export class MongoModule {}
