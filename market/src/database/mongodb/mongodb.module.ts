import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
    Exchange,
    ExchangeSchema
} from './schema/exchange_temp.schema';
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
            { name: Exchange.name, schema: ExchangeSchema},
        ])
    ],
    providers: [
        ExchangeRepository,
    ],
    exports: [
        ExchangeRepository,
    ]
})
export class MongoModule {}
