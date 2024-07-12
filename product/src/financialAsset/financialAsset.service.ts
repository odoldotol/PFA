import { Injectable } from "@nestjs/common";
import { FinancialAssetConfigService } from "src/config";
import {
  InjectRedisRepository,
  RedisCache,
  RedisRepository,
} from "src/database";
import { MarketDateService } from "src/marketDate";
import { MarketApiService } from "src/marketApi";
import { FinancialAssetRedisEntity } from "./financialAsset.redis.entity";
import {
  ExchangeIsoCode,
  FinancialAssetCore,
  MarketDate,
  PriceTuple,
  Ticker
} from "src/common/interface";

@Injectable()
export class FinancialAssetService {

  // private readonly logger = new Logger(AssetService.name);

  private readonly renewalThreshold
  = this.financialAssetConfigSrv.getRenewalThreshold();

  private readonly runningInquireMap
  = new Map<Ticker, Promise<FinancialAssetCore>>();


  constructor(
    private readonly financialAssetConfigSrv: FinancialAssetConfigService,
    @InjectRedisRepository(FinancialAssetRedisEntity)
    private readonly financialAssetRepo: RedisRepository<FinancialAssetCore>,
    private readonly marketApiSrv: MarketApiService,
    private readonly marketDateSrv: MarketDateService,
  ) {}

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
      if (await this.marketDateSrv.isUptodate(financialAssetRedisCache)) { // 최신이면
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

  ///////////////////////////////////////////////////////////////////////////////

  /**
   * @todo 레디스에 쿼리를 병열로? 병렬제한?
   * @todo 업데이트하는중에 동시성문재? 업데이트 중 락.
   * @todo 결과 리턴?
   */
  public async updateOrDelete(
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

}
