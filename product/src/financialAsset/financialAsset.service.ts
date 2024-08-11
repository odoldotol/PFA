import {
  Injectable,
  Logger,
  OnModuleInit
} from "@nestjs/common";
import { FinancialAssetConfigService } from "src/config";
import {
  InjectRedisRepository,
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
import {
  ReplaySubject,
  Subject
} from "rxjs";
import * as X from "rxjs";
import * as F from "@fxts/core";

@Injectable()
export class FinancialAssetService
  implements OnModuleInit
{
  private readonly logger = new Logger(FinancialAssetService.name);

  /**
   * 각 financialAsset 의 count 가 이 값보다 크거나 같아야 renewal 이 일어남.
   */
  private readonly renewalThreshold
  = this.financialAssetConfigSrv.getRenewalThreshold();

  private readonly runningRenewMap = new Map<Ticker, Promise<void>>();

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
      F.peek(this.renewExchange.bind(this)),
      F.toArray
    );
  }

  /**
   * runningInquires 를 기다리는 것으로 동시성 제어.  
   * runningRenew 생성하여 inquire 가 renew 를 기다릴 수 있게 함.
   * 
   * @todo renew 도중 financialAssetService.inquire 동시성 성능 개선.
   * @todo 에러 핸들.
   * 
   * #### 동시성 제어의 측면에서 redis 트렌젝션이 필요한가?
   * 
   * 같은 Ticker 에 대해 renew 중 inquire 하면 불필요한 marketapi 이용과 캐시 업데이트가 발생할 수 있고, 동시성 문제도 있을 수 있음.
   * 각 거래소의 자산에 대한 캐시 업데이트에 소요되는 시간은 하루 한번 찰나의 순간이지만, 개래소가 마감되는 시간에 업데이트가 이루어지는 서비스 성격상,  
   * renew 와 inquire 요청이 빈번하게 동시성을 가질 가능성이 큼.

   * - redis 트렌젝션을 이용하는것이 좋을까?
   * 
   * 이 문제는 FinancialAssetService 의 문제이지, redis 레벨에서 보편적인 문제가 아님.
   * 여기에 redis 트렌젝션을 쓰면 불필요하게 다른 쿼리에 대한 성능 저하, 또는 불필요한 엔지니어링이 필요할 것 같음.
   * 
   * 이미 inquire 가 일괄 처리를 위해 runningInquire 를 생성하고 있기 때문에, renew 에서 동시성으로 얽힐 데이터에 대한 runningInquire 를 생성해 준다면 동시성 문제와 성능이슈 모두 해결할 수 있을것 같음.
   * 또는 단지, 동시성으로 얽힌 inquire 와 renew 가 서로를 기다리도록 하는 것도 괜찮아 보임. (매서드 락?)
   * 
   * 아래와 같은 이유로 간단하게 서로를 기다리는 것으로 동시성을 제어하기로 함.
   * - renew 중인 데이터 중 굉장히 일부만이 inquire 와 동시성으로 얽힐 것이라는 예상.
   * - nodejs 18 성능검사에서 다수의 옵저버블 처리 성능이 생각보다 별로임. => 테스트 해봐야겠지만 성능을 위해 사용하지 않을 옵저버블을 대량으로 만드는 것은 일단은 피해야 함.
   * - 당장에, 다양한 최적화 방법이 있겠지만 일단은 서로 동시성으로 얽히지 않도록 분리해 두는 선에서 가장 간단한 방법으로 구현하고 추후에 성능 이슈를 개선해 나가는게 가장 합리적일 것.
   * 
   */
  public async renewExchange(
    {
      isoCode,
      marketDate,
    }: Pick<ExchangeCore, "isoCode" | "marketDate">,
    priceTupleArr?: PriceTuple[]
  ): Promise<void> {
    if (priceTupleArr === undefined) {
      priceTupleArr = await this.marketApiSrv.fetchPriceTupleArrByISOcode(isoCode);
    }

    const runningInquires: Promise<FinancialAssetCore>[] = [];

    const renewObservable = new Subject<void>();
    const runningRenew = new Promise<void>(r => renewObservable.subscribe({
      complete: r,
      error: err => {
        r();
        this.logger.error(`Renew Error: ${err}`, err?.stack??'');
      }
    }));
    priceTupleArr.forEach(([ symbol ]) => {
      this.runningRenewMap.set(symbol, runningRenew);
      if (this.runningInquireMap.has(symbol)) {
        runningInquires.push(this.runningInquireMap.get(symbol)!);
      }
    });

    if (runningInquires.length > 0) {
      await Promise.allSettled(runningInquires);
    }

    try {
      await this.renewExchangeRaw(
        isoCode,
        marketDate,
        priceTupleArr
      );
      this.logger.verbose(`${isoCode} : renewed`);
      renewObservable.complete();
    } catch (err) {
      renewObservable.error(err);
    } finally {
      priceTupleArr.forEach(([ symbol ]) => {
        this.runningRenewMap.delete(symbol);
      });
    }
  }

  /**
   * - 배치 프로세싱 + 캐싱
   * 
   * runningRenew 를 기다리는 것으로 renew 와의 동시성 제어.  
   * runningInquire 를 생성하여 일괄처리하고 renew 와의 동시성을 제어하는데에 이용.  
   * 캐싱 전에 해결되는 프로미스를 반환하기 떄문에 캐싱과 상관없이 성공하며 캐싱을 기다리지도 않음.  
   * 캐싱 이후 일괄처리를 마무리하며, 그동안은 ReplaySubject 를 이용해서 값을 방출하고 캐싱 이후에는 캐시를 이용함.
   * 
   * @param _id 임시(사용 중지)
   */
  public async inquire(
    ticker: Ticker,
    _id: string = ""
  ): Promise<FinancialAssetCore> {
    if (this.runningRenewMap.has(ticker)) {
      await this.runningRenewMap.get(ticker)!;
    }

    if (!this.runningInquireMap.has(ticker)) {
      const killInquire = () => this.runningInquireMap.delete(ticker);
      const inquireObx = new ReplaySubject<FinancialAssetCore>();

      /**
       * complete 되고나서 delete 전애 inquire 들어올 수 있나?
       * 일단, 완료된 runningInquire 를 읽어도 문제 없음을 확인함.
       */
      inquireObx.subscribe({
        complete: killInquire,
        error: killInquire,
      });

      this.inquireRaw(
        ticker,
        inquireObx,
      );
  
      // inquireObx 는 next 로 값을 방출하고 complete 로 캐싱이 완료됨을 알림. 따라서 firstValueFrom 으로 캐싱을 기다리지 않고 바로 값을 받아올 수 있음.
      this.runningInquireMap.set(ticker, X.firstValueFrom(inquireObx));
    }

    this.financialAssetRepo.count(ticker);
    return this.runningInquireMap.get(ticker)!
  }

  /**
   * 실제 renew 작업. 이것의 호출을 미루는 것으로 동시성 제어.
   * 
   * @todo 레디스에 쿼리를 병열로 날리는데 레디스는 이 제한 같은게 어떻게 되는지 스터디 필요.
   * @todo 결과 리턴? 성공, 실패 있을수 있는것 등. 필요시, renew 중에 들어온 inquire 의 성능 개선에 쓰일 수도 있음.
   * @todo 에러 핸들
   */
  private async renewExchangeRaw(
    isoCode: ExchangeIsoCode,
    marketDate: MarketDate,
    priceTupleArr: PriceTuple[]
  ): Promise<void> {
    const tasks: Promise<any>[] = [];

    tasks.push(this.marketDateRepo.updateOrCreateOne(
      isoCode,
      marketDate
    ));

    await Promise.allSettled(priceTupleArr.map(async priceTuple => {
      if (await this.isGteRenewalThreshold(priceTuple[0])) {
        const financialAsset = await this.financialAssetRepo.findOne(priceTuple[0]);
        if (financialAsset) {
          financialAsset.exchange = isoCode;
          financialAsset.marketDate = marketDate;
          financialAsset.regularMarketLastClose = priceTuple[1];
          financialAsset.regularMarketPreviousClose = priceTuple[2];
          tasks.push(financialAsset.save());
        }
      } else {
        tasks.push(this.financialAssetRepo.deleteOne(priceTuple[0]));
      }

      tasks.push(this.financialAssetRepo.resetCount(priceTuple[0]));
    }));

    await Promise.allSettled(tasks);
  }

  /**
   * 실제 inquire 작업. 이것의 호출을 미루는 것으로 동시성 제어.  
   * ReplaySubject 에 next 로 데이터를 넘기고 나서 캐싱 작업을 함. 모든게 완료되면 ReplaySubject 를 complete.
   * 
   * @todo [refac] exchange: null 인 asset 처리 - fetch logging, caching, always uptodate => 이거 market 서버와 유기적으로 믿을만하게 처리해야함.
   */
  private async inquireRaw(
    ticker: Ticker,
    obx: ReplaySubject<FinancialAssetCore>,
  ): Promise<void> {
    try {
      let financialAssetRedisCache = await this.financialAssetRepo.findOne(ticker);
      if ( // 캐시가 있고, 최신이면
        financialAssetRedisCache !== null &&
        await this.isUptodate(financialAssetRedisCache)
      ) { // next
        obx.next(financialAssetRedisCache.data);
      } else { // 캐시가 없거나 최신이 아니면, fetch 해서 next
        const financialAsset = await this.marketApiSrv.fetchFinancialAsset(ticker);
        obx.next(financialAsset);

        // 캐시를 생성하거나 업데이트 하면 inquire 완료. => 이젠, 그냥 updateOrCreateOne 으로 Set 처리해도 되잖아?
        if (financialAssetRedisCache !== null) {
          financialAssetRedisCache.exchange = financialAsset.exchange;
          financialAssetRedisCache.marketDate = financialAsset.marketDate;
          financialAssetRedisCache.regularMarketLastClose = financialAsset.regularMarketLastClose;
          financialAssetRedisCache.regularMarketPreviousClose = financialAsset.regularMarketPreviousClose;
          await financialAssetRedisCache.save();
        } else {
          await this.financialAssetRepo.createOne(ticker, financialAsset);
        }
      }

      obx.complete();
    } catch (err) {
      obx.error(err);
    }
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

  private async isGteRenewalThreshold(symbol: Ticker): Promise<boolean> {
    return this.renewalThreshold <= await this.financialAssetRepo.getCount(symbol);
  }

}
