import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Yf_info, Yf_infoSchema } from './schema/yf_info.schema';
import { Status_price, Status_priceSchema } from 'src/mongodb/schema/status_price.schema';
import { Log_priceUpdate, Log_priceUpdateSchema } from 'src/mongodb/schema/log_priceUpdate.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Yf_info.name, schema: Yf_infoSchema },
            { name: Status_price.name, schema: Status_priceSchema},
            { name: Log_priceUpdate.name, schema: Log_priceUpdateSchema}
        ])
    ],
    exports: [MongooseModule]
})
export class MongodbModule {}
