import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { UpdaterService } from '@updater.service';
import { DBRepository } from '@database.repository';
import { ResponseGetPriceByTicker } from './response/getPriceByTicker.response';
import F from '@fxts/core';

@Injectable()
export class AppService {

    constructor(
        private readonly updaterService: UpdaterService,
        private readonly dbRepo: DBRepository
    ) {}

    // TODO - Refac - http 모듈
    async getPriceByTicker(ticker: string) {
        let status_price: StatusPrice = undefined;
        const price: FulfilledYfInfo = await this.dbRepo.readPriceByTicker(ticker)
        .then(async res => {
            if (res === null) {
                const createResult = await this.updaterService.addAssets([ticker])
                if (createResult.failure.info.length > 0) {
                    if (createResult.failure.info[0].doc === "Mapping key not found.") {
                        throw new BadRequestException(`Could not find Ticker: ${createResult.failure.info[0].ticker}`);
                    }
                    throw new InternalServerErrorException(createResult.failure.info[0]);
                }
                status_price = createResult.success.status_price[0]
                return createResult.success.info[0]
            } else {
                return res;
            }
        }).catch(err => {
            throw err;
        });
        return new ResponseGetPriceByTicker(
            price.regularMarketLastClose,
            await this.dbRepo.isoCodeToTimezone(price["exchangeTimezoneName"]),
            price.quoteType === "INDEX" ? "INDEX" : price.currency,
            status_price);
    }

    getPriceByExchange = this.dbRepo.readPriceByISOcode;
    createConfigExchange = this.dbRepo.createConfigExchange;

}
