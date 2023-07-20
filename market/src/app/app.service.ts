import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { UpdaterService } from 'src/updater/updater.service';
import { DBRepository } from 'src/database/database.repository';
import { ResponseGetPriceByTicker } from './response/getPriceByTicker.response';
import { exchangeConfigArr } from 'src/config/const/exchanges.const'; //
import { TExchangeCore } from 'src/common/type/exchange.type';

// Todo: 여기에 서비스 없어야함. 다른데로 옴겨. 리팩터링.
@Injectable()
export class AppService {

    constructor(
        private readonly updaterService: UpdaterService,
        private readonly dbRepo: DBRepository
    ) {}

    // TODO - Refac
    async getPriceByTicker(ticker: string) {
        let status_price: TExchangeCore | undefined = undefined; // Todo: Refac
        const price: FulfilledYfInfo = await this.dbRepo.readPriceByTicker(ticker)
        .then(async res => {
            if (res === null) {
                const createResult = await this.updaterService.addAssets([ticker])
                if (createResult.failure.info.length > 0) {
                    if (createResult.failure.info[0].doc === "Mapping key not found.") {
                        throw new NotFoundException(`Could not find Ticker: ${createResult.failure.info[0].ticker}`);
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
            exchangeConfigArr.find(ele => ele.ISO_TimezoneName === price.exchangeTimezoneName)!.ISO_Code, // exchange 리팩터링 후 문제
            price.quoteType === "INDEX" ? "INDEX" : price.currency,
            status_price);
    }

    getPriceByExchange = this.dbRepo.readPriceByISOcode;

}
