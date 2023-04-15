import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { UpdaterService } from './updater/updater.service';
import { DBRepository } from './database/database.repository';

@Injectable()
export class AppService {

    constructor(
        private readonly updaterService: UpdaterService,
        private readonly dbRepo: DBRepository
    ) {}

    /**
     * ### price 조회
     * - ISO_Code 로 조회 => [ticker, price][]
     * - ticker 로 조회 => price
     */
    getPrice = (body) => { // TODO: Refac - 검증부분 파이프로 빼
        if (body.ISO_Code && !body.ticker) {
            return this.getPriceByISOcode(body.ISO_Code);
        } else if (body.ticker && !body.ISO_Code) {
            return this.getPriceByTicker(body.ticker);
        } else {
            throw new BadRequestException('Either ISO_Code or ticker must be provided')
        }
    }

    /**
     * ### TODO - Refac - http 모듈
     * - 없는건 생성해보고 알려준다
     */
    async getPriceByTicker(ticker: string) {
        let status_price = undefined;
        const price: FulfilledYfInfo = await this.dbRepo.readPriceByTicker(ticker)
        .then(async res => {
            if (res === null) {
                const createResult = await this.updaterService.createAssetByTickerArr([ticker])
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
        return {
            price: price.regularMarketLastClose,
            ISO_Code: await this.dbRepo.isoCodeToTimezone(price["exchangeTimezoneName"]),
            currency: price.quoteType === "INDEX" ? "INDEX" : price.currency, status_price
        };
    }

    getPriceByISOcode = this.dbRepo.readPriceByISOcode;
    createConfigExchange = this.dbRepo.createConfigExchange;

}
