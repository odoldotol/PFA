import { Injectable, Logger } from '@nestjs/common';
import { Either } from "src/common/class/either";
import { YF_CCC_ISO_Code } from 'src/config/const/yf_ccc_code.const';
import { ChildApiService } from './child-api/child-api.service';

@Injectable()
export class MarketService {

    private readonly logger = new Logger(MarketService.name);

    constructor(
        private readonly childApiService: ChildApiService) {}

    fetchInfo = (ticker: string) => this.childApiService.fetchYfInfo(ticker)
        .then((res: Either<YfInfoError, GetMarketInfo>) => res.map(v => Object.assign(v.info, v.fastinfo, v.metadata, v.price) as YfInfo));

    fetchPrice = (ticker: string) => this.childApiService.fetchYfPrice(ticker)
        .then((res: Either<YfPriceError, Price>) => res.map(v => Object.assign(v, {symbol: ticker}) as YfPrice));

    // TODO - Refac
    fetchExchangeSession = async (ISO_Code: string): Promise<Either<ExchangeSessionError, ExchangeSession>> => {
        if (ISO_Code === YF_CCC_ISO_Code) {
            const previous = new Date(
                new Date().toISOString().slice(0, 10) // + "T00:00:00.000Z"
            ).toISOString();
            const nextDate = new Date(previous);
            nextDate.setUTCDate(nextDate.getUTCDate() + 1);
            const next = nextDate.toISOString();
            return Either.right({
                previous_open: previous,
                previous_close: previous,
                next_open: next,
                next_close: next
            });
        } else {
            return this.childApiService.fetchEcSession(ISO_Code)}};

}
