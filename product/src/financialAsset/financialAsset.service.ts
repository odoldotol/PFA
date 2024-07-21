import {
  Injectable,
  Logger,
  OnModuleInit
} from "@nestjs/common";
import { FinancialAssetConfigService } from "src/config";
import {
  InjectRedisRepository,
  RedisCache,
  RedisRepository,
} from "src/database";
import { MarketApiService } from "src/marketApi";
import {
  FinancialAssetRedisEntity,
  MarketDateRedisEntity
} from "./redisEntity";
import {
  ExchangeCore,
  ExchangeIsoCode,
  FinancialAssetCore,
  MarketDate,
  PriceTuple,
  Ticker
} from "src/common/interface";
import * as F from "@fxts/core";

@Injectable()
export class FinancialAssetService
  implements OnModuleInit
{
  private readonly logger = new Logger(FinancialAssetService.name);

  private readonly renewalThreshold
  = this.financialAssetConfigSrv.getRenewalThreshold();

  private readonly runningInquireMap
  = new Map<Ticker, Promise<FinancialAssetCore>>();


  constructor(
    private readonly financialAssetConfigSrv: FinancialAssetConfigService,
    @InjectRedisRepository(FinancialAssetRedisEntity)
    private readonly financialAssetRepo: RedisRepository<FinancialAssetCore>,
    @InjectRedisRepository(MarketDateRedisEntity)
    private readonly marketDateRepo: RedisRepository<MarketDate>,
    private readonly marketApiSrv: MarketApiService,
  ) {}

  async onModuleInit(): Promise<void> {
    await F.pipe(
      this.marketApiSrv.fetchAllExchanges(),
      F.toAsync,
      F.reject(this.isUptodate.bind(this)),
      F.peek(async e => this.renewExchange(
        e.isoCode,
        e.marketDate,
        await this.marketApiSrv.fetchPriceTupleArrByISOcode(e.isoCode)
      )),
      F.toArray
    );
  }

  /**
   * #### redis 트렌젝션이 필요한가?
   * 업데이트 중 financialAssetService 에서 inquire 하면 불필요한 marketapi 이용과 캐시 업데이트가 발생할 수 있음.
   * 하지만 성능적인 이슈 이외의 문제는 없는 것으로 판단됨.
   * 각 거래소의 자산에 대한 캐시 업데이트에 소요되는 시간은 하루 한번 찰나의 순간이며, 일단은 이정도 짧은 시간동안의 성능저하는 무시하고 추후에 좀 더 자세히 검토하고 개선하자.
   * 하지만 개래소가 마감되는 시간에 업데이트가 이루어지는 서비스 성격상, 이때 서비스 이용도 높을 가능성이 크기 때문에, 이와 관련된 성능개선은 중요하다고 판단됨.
   * - 새로운 연결로 redis 트렌젝션을 이용하던가,
   * - 업데이트중인 자산에 대한 inquire 를 기존 일괄처리 로직에 편승하여 잠시 시연시키는 방법도 업데이트 중인 Ticker 에 대한 inquire 만 막기에 좋아보임. (메서드를 락)
   *    - 각 Ticker 에 대한 옵저버블을 만들기(nodejs 18 성능검사에서 다수의 옵저버블 처리 성능이 생각보다 별로임) 보다는 하나의 프로미스로 업데이트중인 모든 Ticker 에 대한 메서드 호출을 지연시키는 것이 더 효율적일것임.
   *    - 왜냐하면 업데이트하는 Ticker 들 중 일부만이 업데이트와 동시에 inquire 될 것이기 때문에, 각각의 솔루션을 두어 대체하기보다는, 단지 지연시키고 업데이트 이후에 조회하도록 하는것이 좋음.
   * 
   * @todo 업데이트도중 financialAssetService.inquire 동시성 성능 개선.
   */
  public async renewExchange(
    ISO_Code: string,
    marketDate: MarketDate,
    priceTupleArr: PriceTuple[]
  ) {
    await this.marketDateRepo.updateOrCreateOne(
      ISO_Code,
      marketDate
    );
    await this.renewPriceOfExchange(
      ISO_Code,
      marketDate,
      priceTupleArr
    );
    this.logger.verbose(`${ISO_Code} : renewed`);
  }

  /**
   * - 배치 프로세싱 + 캐싱
   * @todo 엔티티 리팩터링, inquirePrice -> inquireFinancialAsset
   * @todo 배치 프로세싱을 옵저버블 이용하고 캐시 생성 또는 업데이트를 기다리지 않고, 성공여부와 관계없이 리턴할 수 있도록 하기
   * @todo 모두 counting
   */
  public async inquire(
    ticker: Ticker,
    _id: string = ""
  ): Promise<{
    data: FinancialAssetCore;
    updated: boolean;
    created: boolean;
  }> {
    let updated = false;
    let created = false;

    const result = (data: FinancialAssetCore) => ({
      data,
      updated,
      created
    });

    // const devLogger = <T>(arg: T): T => {
    //   this.logger.verbose(
    //     `${ticker} : ${updated ? 'updated' : created ? 'created' : 'read'} | ${_id}`
    //   );
    //   return arg;
    // };

    if (this.runningInquireMap.has(ticker)) {
      return result(
        await this.runningInquireMap.get(ticker)!
        // .then(devLogger)
      );
    }

    const inquirePricePromise = this.inquireRaw(
      ticker,
      () => updated = true,
      () => created = true
    ).finally(() => this.runningInquireMap.delete(ticker));

    this.runningInquireMap.set(ticker, inquirePricePromise);

    return result(
      await inquirePricePromise
      // .then(devLogger)
    );
  }

  /**
   * #### exchange 또는 financialAsset 의 최신여부 반환 
   * - exchange: null 인 asset => true (업데이트 하지 않기위해)
   * @todo [refac] exchange: null 인 asset 처리
   */
  private async isUptodate(
    arg: ExchangeCore | FinancialAssetCore
  ): Promise<boolean> {
    let marketDate: MarketDate;
    let isoCode: ExchangeIsoCode | null;
    if ('exchange' in arg) {
      isoCode = arg.exchange;
    } else {
      isoCode = arg.isoCode;
    }
    marketDate = arg.marketDate;

    if (isoCode === null) {
      return true;
    } else {
      const marketDateCache = await this.marketDateRepo.findOne(isoCode);
      if (marketDateCache) {
        return marketDateCache.isEqualTo(marketDate);
      } else {
        return false;
      }
    }
  }

  /**
   * @todo 레디스에 쿼리를 병열로? 병렬제한?
   * @todo 업데이트하는중에 동시성문재? 업데이트 중 락.
   * @todo 결과 리턴?
   */
  private async renewPriceOfExchange(
    isoCode: ExchangeIsoCode,
    marketDate: MarketDate,
    priceTupleArr: PriceTuple[]
  ): Promise<void> {
    await Promise.all(priceTupleArr.map(async priceTuple => {
      if (await this.isGteRenewalThreshold(priceTuple[0])) {
        await this.financialAssetRepo.findOneAndUpdate(
          priceTuple[0],
          {
            exchange: isoCode,
            marketDate,
            regularMarketLastClose: priceTuple[1],
            regularMarketPreviousClose: priceTuple[2]
          }
        )
      } else {
        await this.financialAssetRepo.deleteOne(priceTuple[0]);
      }

      await this.financialAssetRepo.resetCount(priceTuple[0]);
    }));
  }

  public async isGteRenewalThreshold(symbol: Ticker): Promise<boolean> {
    return this.renewalThreshold <= await this.financialAssetRepo.getCount(symbol)
  }

  /**
   * @todo [refac] exchange: null 인 asset 처리.  
   * exchange null - fetch logging, caching, always uptodate => 이거 market 서버와 유기적으로 믿을만하게 처리해야함.
   */
  private async inquireRaw(
    ticker: Ticker,
    updatedCb: (...args: any) => any,
    createdCb: (...args: any) => any
  ): Promise<FinancialAssetCore> {
    let financialAssetRedisCache = await this.readWithCounting(ticker);
    if (financialAssetRedisCache !== null) { // 있으면
      if (await this.isUptodate(financialAssetRedisCache)) { // 최신이면
        return financialAssetRedisCache.data;
      } else { // 최신아니면
        const financialAsset = await this.marketApiSrv.fetchFinancialAsset(ticker);
        financialAssetRedisCache.marketDate = financialAsset.marketDate;
        financialAssetRedisCache.regularMarketLastClose = financialAsset.regularMarketLastClose;
        financialAssetRedisCache.regularMarketPreviousClose = financialAsset.regularMarketPreviousClose;
        await financialAssetRedisCache.save();
        updatedCb();
        return financialAsset;
      }
    } else { // 없으면
      const financialAsset = await this.marketApiSrv.fetchFinancialAsset(ticker);
      await this.financialAssetRepo.createOne(ticker, financialAsset);
      createdCb();
      return financialAsset;
    }
  }

  /**
   * ### this method calls the incr_count method of the cachedPrice
   * Todo: Redis INCR 이용해서 count 는 별개 엔티티로 관리하자.
   * Todo: findOne -> count -> updateOne
   */
  private async readWithCounting(
    symbol: Ticker
  ): Promise<RedisCache<FinancialAssetCore> | null> {
    const result = await this.financialAssetRepo.findOne(symbol);
    result?.count();
    return result;
  }

}
