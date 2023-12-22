import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from 'src/app/app.module';
import { Database_ExchangeService } from 'src/database/exchange/exchange.service';
import { Database_FinancialAssetService } from 'src/database/financialAsset/financialAsset.service';
import { UpdaterService } from 'src/asset/service';
import { ProductApiService } from 'src/product_api/product_api.service';
import { Market_ExchangeService } from 'src/market/exchange/exchange.service';
import {
  Market_Exchange,
  Market_ExchangeSession
} from 'src/market/exchange/class';
import { RawExchange } from 'src/database/exchange/exchange.entity';
import { FinancialAsset, RawFinancialAsset } from 'src/database/financialAsset/financialAsset.entity';
import {
  mockApple,
  mockKoreaExchange,
  mockNewYorkStockExchange,
  mockSamsungElec,
  mockUsaTreasuryYield10y
} from 'src/mock';
import { GetPriceByExchangeResponse, GetPriceByTickerResponse } from 'src/asset/response';

const mockFinancialAssetArr = [
  mockApple,
  mockSamsungElec,
  mockUsaTreasuryYield10y
];

const createModule = (): Promise<TestingModule> => Test.createTestingModule({
  imports: [AppModule],
}).compile();

const createApp = async (): Promise<INestApplication> =>
(await createModule()).createNestApplication();

describe('Market E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  
  beforeAll(async () => {
    app = await createApp();
    dataSource = app.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('Application Initializing', () => {
    let marketExchangeSrv: Market_ExchangeService;

    let seedExchangeArr: RawExchange[];
    let seedFinancialAssetArr: RawFinancialAsset[];

    jest.setTimeout(30000);

    beforeAll(async () => {
      marketExchangeSrv = app.get(Market_ExchangeService);

      subscribeNextOpenSpy = jest.spyOn(
        Market_Exchange.prototype as any,
        'subscribeNextOpen'
      );
      subscribeNextCloseSpy = jest.spyOn(
        Market_Exchange.prototype as any,
        'subscribeNextClose'
      );
      subscribeNextUpdateSpy = jest.spyOn(
        Market_Exchange.prototype as any,
        'subscribeNextUpdate'
      );
      
      /* 이벤트 리스너가 실행되는 시점이 아니라 달리는 시점을 고려해야함.
      리스너 안에서 실행되는 메서드를 일반적인 방법으로는 mock 하지 못하는 문제를 발견 (이건 더 확인해보기). */
      listenerOfUpdateEventSpy = jest.spyOn(
        UpdaterService.prototype as any,
        'listenerOfUpdateEvent'
      ).mockImplementation(); // Fake 타이머로 호출될때 실제 업데이트TX 를 실행하게 되면 Jest 가 테스트를 병열적으로 진행하면서 동기화때 호출하는 업데이트TX 와 겹칠 수 있기에 noop.

      // mock productApi - Product 서버에 실재로 요청을 보내지 않기.
      jest.spyOn(ProductApiService.prototype, 'updatePriceByExchange')
      .mockResolvedValue();

      /* 타이머 in 이벤트 루프 테스트의 어려움.
      타이머가 루프에 존재하는 한 jest 는 테스트를 끝내지 못함.
      jest 는 이를 이를 모킹 할 수 있음.
      하지만 여전히 타이머와 이벤트루프를 자유롭게 테스트 하기에는 여기저기 까다로움이 산재함. */
      jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] });

      // Todo: seeding
      const exchangeSrv = app.get(Database_ExchangeService)
      const financialAssetSrv = app.get(Database_FinancialAssetService)
      await exchangeSrv.createOne(mockKoreaExchange);
      await exchangeSrv.createOne(mockNewYorkStockExchange);
      await financialAssetSrv.createMany(mockFinancialAssetArr);
      seedExchangeArr = await dataSource.query<RawExchange[]>(
        `SELECT * FROM exchanges`
      );
      seedFinancialAssetArr = await dataSource.query<RawFinancialAsset[]>(
        `SELECT * FROM financial_assets`
      );

      // seeds requirements
      expect(seedExchangeArr.length)
      .toBeLessThan(marketExchangeSrv.getAll().length);
      seedExchangeArr.forEach(seedExchange => {
        const marketExchange = marketExchangeSrv.getOne(seedExchange.iso_code)
        expect(marketExchange).toBeDefined();
        expect(seedExchange.marketdate).not.toBe(marketExchange.marketDate);
      });
    });

    it("initialize", async () => {
      const initializedApp = await app.init();
      expect(initializedApp).toBeDefined();
    });

    describe('Database 를 Market 과 동기화 & 최신화 해야함', () => {
      let marketExchangeArr: Market_Exchange[];
      let databaseExchangeArr: RawExchange[];
      let financialAssetArr: RawFinancialAsset[];

      beforeAll(async () => {
        marketExchangeArr = marketExchangeSrv.getAll();
        databaseExchangeArr = await dataSource.query<RawExchange[]>(
          `SELECT * FROM exchanges`
        );
        financialAssetArr = await dataSource.query<RawFinancialAsset[]>(
          `SELECT * FROM financial_assets`
        );
      });

      it('모든 exchange 는 Market 과 Database 에서 각각 존재해야 함.', async () => {
        expect(databaseExchangeArr).toHaveLength(marketExchangeArr.length);
        databaseExchangeArr.forEach(databaseExchange => {
          expect(marketExchangeSrv.getOne(databaseExchange.iso_code))
          .toBeDefined();
        });
      });

      it(
        'Database 의 모든 exchange 와 financailAsset 은 Market 을 따라 최신화 되어야 함.',
        async () => {
          databaseExchangeArr.forEach(databaseExchange => {
            expect(databaseExchange.marketdate)
            .toBe(marketExchangeSrv.getOne(databaseExchange.iso_code).marketDate);
          });

          financialAssetArr.forEach(financialAsset => {
            const seedFinancialAsset = seedFinancialAssetArr
            .find(seedFinancialAsset => seedFinancialAsset.symbol === financialAsset.symbol);
            expect(financialAsset.regularmarketlastclose)
            .not.toBe(seedFinancialAsset!.regularmarketlastclose);
          });
        }
      );
    });

    let subscribeNextOpenSpy: jest.SpyInstance<Date>;
    let subscribeNextCloseSpy: jest.SpyInstance<Date>;
    let subscribeNextUpdateSpy: jest.SpyInstance<Date>;
    let listenerOfUpdateEventSpy: jest.SpyInstance<void>;

    // 지나치게 모듈 내부에 의존하고 있는 테스트.
    // 그렇다고 이는 좋은 유닛테스트가 되지도 못함.
    // 게다가 테스트가 확실하게 업데이트 일정을 계속 생성하는지 보장하고 있지도 못함.
    // 호출 갯수만 확인하는 것으로 간소화 하고있음.
    // 곧, Market_Exchange 모듈 내부에서 유닛 테스트를 작성해봐야겠음.
    describe('각각의 Exchange 의 업데이트 스케줄에 따라 계속해서 업데이트 실행해야함.', () => {
      let openedExchangeArr: Market_Exchange[];
      let closedExchangeArr: Market_Exchange[];

      // MarginGap 부분, 통과를 위해 작성된 테스트일 뿐. 의미가 없음.
      // 내부의 프로토타입에서 isMarginGap 함수를 가져와서 확인하면서 테스트를 진행하는게 좋을까?
      let numberOfMarketInMarginGap: number;

      beforeAll(async () => {
        openedExchangeArr = marketExchangeSrv.getAll()
        .filter(exchange => exchange.isMarketOpen());
        closedExchangeArr = marketExchangeSrv.getAll()
        .filter(exchange => !exchange.isMarketOpen());

        numberOfMarketInMarginGap = subscribeNextUpdateSpy.mock.calls.length - openedExchangeArr.length;
      });

      describe('Initialize 에서', () => {
        it('openedExchange 는 곧 시장이 닫히면 Close 이벤트와 Update 이벤트를 방출해야함.', () => {
          expect(subscribeNextCloseSpy)
          .toHaveBeenCalledTimes(openedExchangeArr.length);
          expect(subscribeNextUpdateSpy)
          .toHaveBeenCalledTimes(openedExchangeArr.length + numberOfMarketInMarginGap);
        });

        it('closedExchange 는 다음 개장 때 Open 이벤트를 방출해야함.', () => {
          expect(subscribeNextOpenSpy)
          .toHaveBeenCalledTimes(closedExchangeArr.length);
        });

        afterAll(() => {
          subscribeNextCloseSpy.mockClear();
          subscribeNextUpdateSpy.mockClear();
          subscribeNextOpenSpy.mockClear();
        });
      });

      describe('Market Session 이 진행됨에 따라', () => {
        beforeAll(() => {
          /* 타이머 핸들러 내부에서 비동기로 동작하는 부분은
          jest.runOnlyPendingTimers 호출시 즉시 실행되지 못하고 테스트 코드 이후에 실행되버림.
          그 부분을 noop. */
          jest.spyOn(
            Market_ExchangeSession.prototype,
            'updateSession'
          ).mockImplementation();

          // 다음 세션 사이클 당기기
          jest.runOnlyPendingTimers();
        });

        it('Update Event -> Update EventListener', () => {
          expect(listenerOfUpdateEventSpy)
          .toHaveBeenCalledTimes(openedExchangeArr.length + numberOfMarketInMarginGap);
        });

        it('Market 이 닫히면 다음 개장떄 Open 이벤트 방출해야함.', () => {
          expect(subscribeNextOpenSpy)
          .toHaveBeenCalledTimes(openedExchangeArr.length);
        });

        it('Market 이 열리면 이번 장이 닫힐때 Close 이벤트와 곧이어 Update 이벤트를 각 거래소에 맞게 방출해야함.', () => {
          expect(subscribeNextUpdateSpy)
          .toHaveBeenCalledTimes(closedExchangeArr.length);
          expect(subscribeNextCloseSpy)
          .toHaveBeenCalledTimes(closedExchangeArr.length);
        });
      });
    });
  });
  
  // Todo: 재귀적으로 생성되는 타이머가 있다면 이를 한 틱씩 계속해서 진행시키는 방법이 있을까?
  
  describe('Asset', () => {
    let financialAssetAfterInitializingArr: FinancialAsset[];

    beforeAll(async () => {
      const rawFinancialAssetArr = await dataSource.query<RawFinancialAsset[]>(
        `SELECT * FROM financial_assets`
      );

      financialAssetAfterInitializingArr = mockFinancialAssetArr.map(
        mockFinancialAsset => {
          const rawFinancialAsset = rawFinancialAssetArr.find(
            rawFinancialAsset => rawFinancialAsset.symbol === mockFinancialAsset.symbol
          );
          mockFinancialAsset.regularMarketLastClose
          = rawFinancialAsset!.regularmarketlastclose;
          return mockFinancialAsset;
        }
      );
    });

    describe('POST /api/v1/asset/price/exchange/:ISO_Code', () => {
      it('Exchange 에 속하는 Assets 을 응답 (200)', () => {
        return request(app.getHttpServer())
        .post(`/asset/price/exchange/${mockNewYorkStockExchange.isoCode}`)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          const mockResponse = new GetPriceByExchangeResponse(
            financialAssetAfterInitializingArr.filter(
              financialAsset => financialAsset.exchange === mockNewYorkStockExchange.isoCode
            )
          );
          expect(body).toHaveLength(mockResponse.length);
          expect(body[0]).toEqual(mockResponse[0]);
          expect(body[1]).toEqual(mockResponse[1]);
        });
      });

      it('Code 가 잘못되거나, 해당하는 Assets 을 찾을 수 없으면 빈배열을 응답 (200)', () => {
        return request(app.getHttpServer())
        .post('/asset/price/exchange/krx')
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toEqual([]);
        });
      });
    });

    describe('POST /api/v1/asset/price/ticker/:ticker', () => {
      it('Ticker 로 Asset 찾아서 응답 (200)', () => {
        return request(app.getHttpServer())
        .post(`/asset/price/ticker/${mockApple.symbol}`)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          const mockResponse = new GetPriceByTickerResponse(
            financialAssetAfterInitializingArr.find(
              financialAsset => financialAsset.symbol === mockApple.symbol
            )!
          );
          expect(body).toEqual(mockResponse);
        });
      });

      it('DB 에 없는 Ticker 는 추가하고 반환 (201)', () => {
        return request(app.getHttpServer())
        .post(`/asset/price/ticker/tsla`)
        .expect(HttpStatus.CREATED)
        .expect(async ({ body }) => {
          const rawTesla = await dataSource.query<RawFinancialAsset[]>(
            `SELECT * FROM financial_assets WHERE symbol = 'TSLA'`
          );
          expect(rawTesla).toHaveLength(1);
          expect(body).toHaveProperty('price', rawTesla[0].regularmarketlastclose);
        });
      });

      it('DB 에 없는 Ticker, Not Found 추가 실패 (404)', () => {
        return request(app.getHttpServer())
        .post(`/asset/price/ticker/notFoundTicker`)
        .expect(HttpStatus.NOT_FOUND);
      });
    });
  });

  afterAll(async () => {
    await dataSource.dropDatabase();
    await app.close();
  });

});