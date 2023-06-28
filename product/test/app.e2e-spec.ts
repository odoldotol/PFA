import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from 'src/app/app.module';
import { PriceService } from 'src/database/inMemory/price.service';
import { MarketApiService } from 'src/market/market-api/market-api.service';
import { MarketDate } from 'src/common/class/marketDate.class';

describe('Price 조회', () => {
  let app: INestApplication;
  let marketApiService: MarketApiService;
  let priceService: PriceService;

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
      "ISO_Code": ISO_CODE,
      "lastMarketDate": "2023-06-26T20:00:00.000Z",
      "yf_exchangeTimezoneName": "America/New_York",
  }];
  const MOCK_FETCHED_ASSETS_BY_ISO_CODE: PSet[] = [[
    SYMBOL,
    PRICE,
    CURRENCY
  ]];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    priceService = app.get(PriceService);
    marketApiService = app.get(MarketApiService);
    
    jest.spyOn(marketApiService, 'fetchAllSpDoc').mockResolvedValue(MOCK_FETCHED_SPDOCS);
    jest.spyOn(marketApiService, 'fetchPriceByISOcode').mockResolvedValue(MOCK_FETCHED_ASSETS_BY_ISO_CODE);

    await app.init();
    await priceService.delete(SYMBOL);
  });

  afterAll(async () => {
    await app.close();
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
});

// TODO: 없는거 조회시 mongodb 에 추가되서 돌아오는 경우
// 일단, 지금은 마켓에서 거래소 정기 업뎃 전파될때 거래소 데이터 생성 및 업뎃 되기떄문에 이에 대한 추가작업은 불필요하다.

// TODO: 마켓에서 전파된 업데이트를 잘 반영하는가
  // Asset - 업뎃, 삭제, 유지 (카운트에 따라?)
  // price 상태 업뎃, 생성


/**
 * TODO: 초기화시 최신화 되지 않은것만 선택적 업데이트
 */
