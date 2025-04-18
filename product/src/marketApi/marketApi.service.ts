import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {
  catchError,
  firstValueFrom,
  map
} from 'rxjs';
import {
  InjectRedisRepository,
  RedisRepository
} from 'src/database';
import { NotFoundTickerRedisEntity } from './notFoundTicker.redis.entity';
import {
  GET_ALL_EXCHANGES_PATH,
  INQUIRE_ASSET_PATH,
  GET_PRICE_BY_EXCHANGE_PATH,
} from './const';
import {
  ExchangeCore,
  FinancialAssetCore,
  PriceTuple,
  Ticker
} from 'src/common/interface';
import { joinSlash } from 'src/common/util';

@Injectable()
export class MarketApiService {

  private readonly logger = new Logger(MarketApiService.name);

  private readonly runningFetchFinancialAsset = new Map<Ticker, Promise<FinancialAssetCore>>();

  constructor(
    private httpService: HttpService,
    @InjectRedisRepository(NotFoundTickerRedisEntity)
    private readonly notFoundTickerRepo: RedisRepository<object>,
  ) {}

  public fetchAllExchanges() {
    return firstValueFrom(this.httpService.get(GET_ALL_EXCHANGES_PATH).pipe(
      map(res => res.data as ExchangeCore[])
    ));
  }

  public fetchPriceTupleArrByISOcode(ISO_Code: string) {
    return firstValueFrom(this.httpService.get(joinSlash(GET_PRICE_BY_EXCHANGE_PATH, ISO_Code)).pipe(
      map(res => res.data as PriceTuple[])
    ));
  }

  /**
   * - 배치 프로세싱
   * @todo 프로젝트 전체 에러 처리 리팩터링
   */
  public async fetchFinancialAsset(ticker: Ticker): Promise<FinancialAssetCore> {
    const notFoundTickerCache = await this.notFoundTickerRepo.findOne(ticker);
    if (notFoundTickerCache) {
      throw new NotFoundException(notFoundTickerCache.data);
    }

    if (this.runningFetchFinancialAsset.has(ticker)) {
      return this.runningFetchFinancialAsset.get(ticker)!;
    }

    const fetchFinancialAsset = firstValueFrom(
      this.httpService.post<FinancialAssetCore>(joinSlash(INQUIRE_ASSET_PATH, ticker))
      .pipe(
        catchError(err => {
          if (err.response === undefined) {
            throw err;
          } else {
            switch (err.response.status) {
              case 404:
                this.notFoundTickerRepo.createOne(ticker, err.response.data)
                .catch(err => this.logger.error(err))
                .finally(() => this.runningFetchFinancialAsset.delete(ticker));
                throw new NotFoundException(err.response.data);
              default:
                this.runningFetchFinancialAsset.delete(ticker);
                throw new InternalServerErrorException(err.response.data);
            }
          }
        }),
        map(res => res.data)
      )
    )
    .then(res => {
      this.runningFetchFinancialAsset.delete(ticker);
      return res;
    })

    this.runningFetchFinancialAsset.set(ticker, fetchFinancialAsset);

    return fetchFinancialAsset;
  }

}
