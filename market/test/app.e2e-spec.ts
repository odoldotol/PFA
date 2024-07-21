import { Test } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from 'src/app/app.module';
import { Database_ExchangeService } from 'src/database/exchange/exchange.service';
import { Database_FinancialAssetService } from 'src/database/financialAsset/financialAsset.service';
import { UpdaterService } from 'src/updater/updater.service';
import { ProductApiService } from 'src/productApi/productApi.service';
import { Market_ExchangeService } from 'src/market/exchange/exchange.service';
import { ExchangeEntity } from 'src/database/exchange/exchange.entity';
import { FinancialAssetEntity } from 'src/database/financialAsset/financialAsset.entity';
import {
  Market_Exchange,
  Market_ExchangeSession
} from 'src/market/exchange/class';
import { FinancialAsset } from 'src/common/class/financialAsset';
import { MARKET_DATE_DEFAULT, MarketDate } from 'src/common/interface';
import {
  mockApple,
  mockKoreaExchange,
  mockNewYorkStockExchange,
  mockSamsungElec,
  mockUsaTreasuryYield10y
} from 'src/mock';
import { GetPriceByExchangeResponse } from 'src/asset/response';

const mockFinancialAssetArr = [
  mockApple,
  mockSamsungElec,
  mockUsaTreasuryYield10y
];

// Todo: MarketChild 서버와 통합 테스트처럼 진행하지 말도록. 통합테스트는 따로 진행할 것.

describe('Market E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let marketExchangeSrv: Market_ExchangeService;
  
  beforeAll(async () => {
    app = await createApp();
    dataSource = app.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('Application Initializing', () => {
    let seedExchangeArr: ExchangeEntity[];
    let seedFinancialAssetArr: FinancialAssetEntity[];

    jest.setTimeout(120000);

    beforeAll(async () => {
      marketExchangeSrv = app.get(Market_ExchangeService);

      subscribeNextOpenSpy = jest.spyOn(
        Market_Exchange.prototype as any,
        'subscribeNextOpen'
      );
      subscribeCloseSpy = jest.spyOn(
        Market_Exchange.prototype as any,
        'subscribeClose'
      );
      subscribeUpdateSpy = jest.spyOn(
        Market_Exchange.prototype as any,
        'subscribeUpdate'
      );
      
      /* 이벤트 리스너가 실행되는 시점이 아니라 달리는 시점을 고려해야함.
      리스너 안에서 실행되는 메서드를 일반적인 방법으로는 mock 하지 못하는 문제를 발견 (이건 더 확인해보기). */
      listenerOfUpdateEventSpy = jest.spyOn(
        UpdaterService.prototype as any,
        'updater'
      ).mockImplementation(); // Fake 타이머로 호출될때 실제 업데이트TX 를 실행하게 되면 Jest 가 테스트를 병열적으로 진행하면서 동기화때 호출하는 업데이트TX 와 겹칠 수 있기에 noop.

      // mock productApi - Product 서버에 실재로 요청을 보내지 않기.
      jest.spyOn(ProductApiService.prototype, 'renewFinancialAssetExchange')
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
      seedExchangeArr = await dataSource.query<ExchangeEntity[]>(
        `SELECT * FROM exchanges`
      );
      seedFinancialAssetArr = await dataSource.query<FinancialAssetEntity[]>(
        `SELECT * FROM financial_assets`
      );

      // seeds requirements
      expect(seedExchangeArr.length)
      .toBeLessThan(marketExchangeSrv.getAll().length);
      seedExchangeArr.forEach(seedExchange => {
        const marketExchange = marketExchangeSrv.getOne(seedExchange.iso_code)
        expect(marketExchange).toBeDefined();
        expect(seedExchange.market_date).not.toBe(marketExchange.marketDate);
      });
    });

    it("initialize", async () => {
      const initializedApp = await app.init();
      expect(initializedApp).toBeDefined();
    });

    describe('Database 를 Market 과 동기화 & 최신화 해야함', () => {
      let marketExchangeArr: Market_Exchange[];
      let databaseExchangeArr: ExchangeEntity[];
      let financialAssetArr: FinancialAssetEntity[];

      beforeAll(async () => {
        marketExchangeArr = marketExchangeSrv.getAll();
        databaseExchangeArr = await dataSource.query<ExchangeEntity[]>(
          `SELECT * FROM exchanges`
        );
        financialAssetArr = await dataSource.query<FinancialAssetEntity[]>(
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
            expect(databaseExchange.market_date)
            .toBe(marketExchangeSrv.getOne(databaseExchange.iso_code).marketDate);
          });

          financialAssetArr.forEach(financialAsset => {
            const seedFinancialAsset
            = seedFinancialAssetArr.find(seedFinancialAsset => seedFinancialAsset.symbol === financialAsset.symbol);

            expect(financialAsset.regular_market_last_close).not.toBe(seedFinancialAsset!.regular_market_last_close);
            
            expect(financialAsset.market_date).not.toBe(seedFinancialAsset!.market_date);
          });
        }
      );
    });

    let subscribeNextOpenSpy: jest.SpyInstance<Date>;
    let subscribeCloseSpy: jest.SpyInstance<Date>;
    let subscribeUpdateSpy: jest.SpyInstance<Date>;
    let listenerOfUpdateEventSpy: jest.SpyInstance<void>;

    // 지나치게 모듈 내부에 의존하고 있는 테스트.
    // 그렇다고 이는 좋은 유닛테스트가 되지도 못함.
    // 게다가 테스트가 확실하게 업데이트 일정을 계속 생성하는지 보장하고 있지도 못함.
    // 호출 갯수만 확인하는 것으로 간소화 하고있음.
    // 곧, Market_Exchange 모듈 내부에서 유닛 테스트를 작성해봐야겠음.
    describe('각각의 Exchange 의 업데이트 스케줄에 따라 계속해서 업데이트 실행해야함.', () => {

      it.todo('initialize 시점이 Open, Close, 세션마진구간 어디에서든 모두 문제없음을 테스트해야함.');

      let exchangeArr: Market_Exchange[];

      let openSpyCallLength: number;
      let closeSpyCallLength: number;
      let updateSpyCallLength: number;

      beforeAll(async () => {
        exchangeArr = marketExchangeSrv.getAll();
      });

      describe('Initialize 에서', () => {
        it('Close 이벤트 예약과 Open 이벤트 예약의 합은 Exchange 갯수와 같아야함', () => {
          closeSpyCallLength = subscribeCloseSpy.mock.calls.length;
          openSpyCallLength = subscribeNextOpenSpy.mock.calls.length;
          expect(closeSpyCallLength + openSpyCallLength)
          .toBe(exchangeArr.length);
        });

        it('Update 이벤트 예약은 Open 이벤트 예약과 같아야함', () => {
          updateSpyCallLength = subscribeUpdateSpy.mock.calls.length;
          expect(updateSpyCallLength)
          .toBe(openSpyCallLength);
        });

        afterAll(() => {
          subscribeCloseSpy.mockClear();
          subscribeUpdateSpy.mockClear();
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
          .toHaveBeenCalledTimes(updateSpyCallLength);
        });

        it('Close 이벤트 예약과 Open 이벤트 예약의 합은 Exchange 갯수와 같아야함', () => {
          closeSpyCallLength = subscribeCloseSpy.mock.calls.length;
          openSpyCallLength = subscribeNextOpenSpy.mock.calls.length;
          expect(closeSpyCallLength + openSpyCallLength)
          .toBe(exchangeArr.length);
        });
      });
    });
  });
  
  // Todo: 재귀적으로 생성되는 타이머가 있다면 이를 한 틱씩 계속해서 진행시키는 방법이 있을까?
  
  describe('Asset', () => {
    const NOT_FOUND_TICKER = 'notFoundTicker';
    let financialAssetAfterInitializingArr: FinancialAsset[];

    beforeAll(async () => {
      const rawFinancialAssetArr = await dataSource.query<FinancialAssetEntity[]>(
        `SELECT * FROM financial_assets`
      );

      financialAssetAfterInitializingArr = mockFinancialAssetArr.map(
        mockFinancialAsset => {
          const rawFinancialAsset = rawFinancialAssetArr.find(
            rawFinancialAsset => rawFinancialAsset.symbol === mockFinancialAsset.symbol
          );
          let newMarketDate: MarketDate;
          if (rawFinancialAsset!.exchange === null) {
            newMarketDate = MARKET_DATE_DEFAULT;
          } else {
            newMarketDate = marketExchangeSrv.getOne(rawFinancialAsset!.exchange).marketDate;
          }

          return Object.assign(mockFinancialAsset, {
            regularMarketLastClose: rawFinancialAsset!.regular_market_last_close,
            regular_market_last_close: rawFinancialAsset!.regular_market_last_close,
            regularMarketPreviousClose: rawFinancialAsset!.regular_market_previous_close,
            regular_market_previous_close: rawFinancialAsset!.regular_market_previous_close,
            marketDate: newMarketDate,
            market_date: newMarketDate
          });
        }
      );
    });

    describe('GET /api/v1/asset/price/:ISO_Code', () => {
      it('Exchange 에 속하는 Assets 을 응답 (200)', () => {
        return request(app.getHttpServer())
        .get(`/asset/price/${mockNewYorkStockExchange.isoCode}`)
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
        .get('/asset/price/krx')
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toEqual([]);
        });
      });
    });

    describe('POST /api/v1/asset/inquire/:ticker', () => {
      it('Ticker 로 Asset 찾아서 응답 (200)', () => {
        return request(app.getHttpServer())
        .post(`/asset/inquire/${mockApple.symbol}`)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          const mockResponse = financialAssetAfterInitializingArr.find(
            financialAsset => financialAsset.symbol === mockApple.symbol
          );
          expect(mockResponse).toBeDefined();
          expect(body).toEqual(mockResponse);
        });
      });

      it('DB 에 없는 Ticker 는 추가하고 반환 (201)', () => {
        return request(app.getHttpServer())
        .post(`/asset/inquire/tsla`)
        .expect(HttpStatus.CREATED)
        .expect(async ({ body }) => {
          const rawTesla = await dataSource.query<FinancialAssetEntity[]>(
            `SELECT * FROM financial_assets WHERE symbol = 'TSLA'`
          );
          expect(rawTesla).toHaveLength(1);
          expect(body).toHaveProperty('regularMarketLastClose', rawTesla[0]!.regular_market_last_close);
        });
      });

      it('DB 에 없는 Ticker, Not Found 추가 실패 (404)', () => {
        return request(app.getHttpServer())
        .post(`/asset/inquire/${NOT_FOUND_TICKER}`)
        .expect(HttpStatus.NOT_FOUND)
        .expect(({ body }) => {
          expect(body).toHaveProperty('ticker', NOT_FOUND_TICKER.toUpperCase()); //
        });
      });
    });
  });

  afterAll(async () => {
    await dataSource.dropDatabase();
    await app.close();
  });
});

const createApp = async (): Promise<INestApplication> =>
(await moduleBuilder.compile()).createNestApplication();

const moduleBuilder = Test.createTestingModule({
  imports: [AppModule],
});