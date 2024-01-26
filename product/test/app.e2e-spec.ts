import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from 'src/app/app.module';
import { migrationRun } from 'src/../devMigrations/migration';
import { MigrationUpdatedAtTriggers } from 'src/../devMigrations/postgres/updatedAtTriggers-Migration';
import { PriceService } from 'src/database/inMemory/price.service';
import { MarketApiService } from 'src/market/market-api/market-api.service';
import { ConnectionService } from 'src/market/market-api/connection.service';
import { MarketDate } from 'src/common/class/marketDate.class';

const SYMBOL = 'AAPL';
const CURRENCY = 'USD';
const PRICE = 185.27000427246094;
const ISO_CODE = 'XNYS';

const MOCK_FETCHED_ASSET = {
  "price": PRICE,
  "ISO_Code": ISO_CODE,
  "currency": CURRENCY,
};
const MOCK_FETCHED_SPDOCS = [{
  "isoCode": ISO_CODE,
  "marketDate": "2023-06-26T20:00:00.000Z",
  "isoTimezoneName": "America/New_York",
}];
const MOCK_FETCHED_ASSETS_BY_ISO_CODE: PSet[] = [[
  SYMBOL,
  PRICE,
  CURRENCY
]];

describe('Product E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  let marketApiService: MarketApiService;
  let priceService: PriceService;

  beforeAll(async () => {
    app = await createApp();
    dataSource = app.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('Application Initializing', () => {

    beforeAll(async () => {
      priceService = app.get(PriceService);
      marketApiService = app.get(MarketApiService);
      const marketApiConnectionService = app.get(ConnectionService);
      
      jest.spyOn(marketApiConnectionService, 'onModuleInit').mockReturnValue(Promise.resolve());
      jest.spyOn(marketApiService, 'fetchAllSpDoc').mockResolvedValue(MOCK_FETCHED_SPDOCS);
      jest.spyOn(marketApiService, 'fetchPriceByISOcode').mockResolvedValue(MOCK_FETCHED_ASSETS_BY_ISO_CODE);
    });

    it("initialize", async () => {
      const initializedApp = await app.init();
      await migrationRun(MigrationUpdatedAtTriggers, dataSource);
      expect(initializedApp).toBeDefined();
    });

    it.todo('앱 초기화시 최신화 되지 않은 Market 의 선택적 업데이트');
  });

  describe(`Price 조회 로직. POST /dev/price/{ticker}`, () => {

    beforeAll(async () => {
      await priceService.delete(SYMBOL);
    });
  
    beforeEach(() => {
      jest.spyOn(marketApiService, 'fetchPriceByTicker').mockResolvedValueOnce(MOCK_FETCHED_ASSET)
      jest.spyOn(priceService, 'read_with_counting');
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    let asset: CachedPriceI;
  
    it('인메모리에 없는경우 (010) => market api 로 가져와서 create, count = 1', () => {
      jest.spyOn(priceService, 'create');
      return request(app.getHttpServer())
        .post(`/dev/price/${SYMBOL}`)
        .expect(200)
        .expect(res => {
          const body = res.body;
          asset = res.body;
          expect(marketApiService.fetchPriceByTicker).toBeCalledWith(SYMBOL);
          expect(marketApiService.fetchPriceByTicker).toBeCalledTimes(1);
          expect(priceService.read_with_counting).toBeCalledTimes(1);
          expect(priceService.create).toBeCalledTimes(1);
          expect(body).toHaveProperty('price');
          expect(body).toHaveProperty('ISO_Code');
          expect(body).toHaveProperty('currency');
          expect(body).toHaveProperty('marketDate');
          expect(body).toHaveProperty('count', 1);
        });
    });
  
    it('인메모리에 있고 최신인 경우 (100) => 단순 조회, count++', () => {
      return request(app.getHttpServer())
        .post(`/dev/price/${SYMBOL}`)
        .expect(200)
        .expect(res => {
          const body = res.body;
          expect(marketApiService.fetchPriceByTicker).toBeCalledTimes(0);
          expect(priceService.read_with_counting).toBeCalledTimes(1);
          expect(body).toHaveProperty('price', PRICE);
          expect(body).toHaveProperty('ISO_Code', ISO_CODE);
          expect(body).toHaveProperty('currency', CURRENCY);
          expect(body).toHaveProperty('marketDate', asset.marketDate);
          expect(body).toHaveProperty('count', 2);
        });
    });
  
    it('인메모리에 있지만 최신 아닌 경우 (101) => market api 로 가져와서 update, count++', async () => {
      await priceService.update([SYMBOL, {
        price: 1,
        marketDate: new MarketDate('1990-03-25')
      }]);
      jest.spyOn(priceService, 'update');
      return request(app.getHttpServer())
        .post(`/dev/price/${SYMBOL}`)
        .expect(200)
        .expect(res => {
          const body = res.body;
          expect(marketApiService.fetchPriceByTicker).toBeCalledWith(SYMBOL);
          expect(marketApiService.fetchPriceByTicker).toBeCalledTimes(1);
          expect(priceService.read_with_counting).toBeCalledTimes(1);
          expect(priceService.update).toBeCalledTimes(1);
          expect(body).toHaveProperty('price', PRICE);
          expect(body).toHaveProperty('ISO_Code', ISO_CODE);
          expect(body).toHaveProperty('currency', CURRENCY);
          expect(body).toHaveProperty('marketDate', asset.marketDate);
          expect(body).toHaveProperty('count', 3);
        });
    });
  
    it.todo('결국 찾지 못함 => NotFound');
  });

  // TODO: 없는거 조회시 mongodb 에 추가되서 돌아오는 경우
  // 일단, 지금은 마켓에서 거래소 정기 업뎃 전파될때 거래소 데이터 생성 및 업뎃 되기떄문에 이에 대한 추가작업은 불필요하다.

  describe(`Market 서버에서 전파된 업데이트를 잘 반영하는가. POST /market/update/price/exchange/{ISO_Code}`, () => {
    it.todo('Asset 의 업데이트, 삭제, 유지');
    it.todo('MarketDate 의 업데이트, 생성');
  });

  describe('KakaoChatbot', () => {
    // 공통
    it.todo('forbidden');
    it.todo('unexpected error');

    describe('asset/inquire', () => {
      it.todo('구독 activated inquire');
      it.todo('구독 deactivated inquire');
      it.todo('구독 없음 inquire');
    });

    describe('asset-subscription/add', () => {
      it.todo('구독 없음 add');
      it.todo('구독 deactivated add');
    });

    describe('asset-subscription/cancel', () => {
      it.todo('구독 activated cancel');
    });

    describe('asset/subscriptions/inquire', () => {
      it.todo('구독 없음 inquire');
      it.todo('구독 있음 inquire');
    });

    describe('report', () => {
      it.todo('not found report');
      it.todo('etc');
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