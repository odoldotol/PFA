import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
    Yf_info,
    Yf_infoSchema
} from './schema/yf_info.schema';
import {
    Exchange,
    ExchangeSchema
} from './schema/exchange_temp.schema';
import { Yf_infoRepository } from './repository/yf-info.repository';
import { ExchangeRepository } from './repository/exchange_temp.repository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/common/interface/environmentVariables.interface';
import { EnvKey } from 'src/common/enum/envKey.emun';

@Module({
    imports: [
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService<EnvironmentVariables>) => ({
                uri: configService.get(EnvKey.MONGODB_URI),
            }),
            inject: [ConfigService],
        }),
        MongooseModule.forFeature([
            { name: Yf_info.name, schema: Yf_infoSchema },
            { name: Exchange.name, schema: ExchangeSchema},
        ])
    ],
    providers: [
        Yf_infoRepository,
        ExchangeRepository,
    ],
    exports: [
        Yf_infoRepository,
        ExchangeRepository,
    ]
})
export class MongoModule {}
