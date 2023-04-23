import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Either } from "@common/class/either.class";
import { ChildApiService } from './child-api/child-api.service';

@Injectable()
export class MarketService {

    private readonly logger = new Logger(MarketService.name);
    private readonly YFCCC_ISO_Code = this.configService.get<string>('YahooFinance_CCC_ISO_Code', "XCCC");

    constructor(
        private readonly configService: ConfigService,
        private readonly childApiService: ChildApiService) {}

    fetchInfo = (ticker: string) => this.childApiService.fetchYfInfo(ticker)
        .then((res: Either<YfInfoError, GetMarketInfo>) => res.map(v => Object.assign(v.info, v.fastinfo, v.metadata, v.price) as YfInfo));

    fetchPrice = (ticker: string) => this.childApiService.fetchYfPrice(ticker)
        .then((res: Either<YfPriceError, Price>) => res.map(v => (v['symbol'] = ticker, v) as YfPrice));

    // TODO - Refac
    fetchExchangeSession = async (ISO_Code: string): Promise<Either<ExchangeSessionError, ExchangeSession>> => {
        if (ISO_Code === this.YFCCC_ISO_Code) {
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
