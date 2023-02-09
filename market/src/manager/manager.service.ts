import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { UpdaterService } from '../updater/updater.service';
import { DBRepository } from '../database/database.repository';

@Injectable()
export class ManagerService {

    private readonly logger = new Logger(ManagerService.name);

    constructor(
        private readonly updaterService: UpdaterService,
        private readonly dbRepo: DBRepository
    ) {}

    /**
     * ### ticker 로 조회 => price
     * - 없는건 생성해보고 알려준다
     */
    async getPriceByTicker(ticker: string) {
        try {
            let status_price = undefined;
            const price = await this.dbRepo.getPriceByTicker(ticker)
            .then(async res => {
                if (res === null) {
                    const createResult = await this.updaterService.createAssets([ticker])
                    if (createResult.failure.info.length > 0) {
                        if (createResult.failure.info[0].error.doc === "Mapping key not found.") {
                            throw new BadRequestException(`Could not find Ticker: ${createResult.failure.info[0].error.ticker}`);
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
            const ISOcode = await this.dbRepo.isoCodeToTimezone(price["exchangeTimezoneName"]);
            return {price: price.regularMarketLastClose, ISOcode, status_price};
        } catch (error) {
            throw error;
        };
    }

}
