import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app/app.module';
import { PriceService } from 'src/database/inMemory/price.service';
import { MarketApiService } from 'src/market/market-api/market-api.service';
import { MarketDate } from 'src/common/class/marketDate.class';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ "status": "ok" });
  });
});

describe('Price', () => {
  let app: INestApplication;
  let marketApiService: MarketApiService;
  let priceService: PriceService;

  const SYMBOL = 'AAPL';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    priceService = app.get(PriceService);
    marketApiService = app.get(MarketApiService);
    
    await app.init();
    await priceService.delete(SYMBOL);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.spyOn(marketApiService, 'fetchPriceByTicker');
    jest.spyOn(priceService, 'read_with_counting');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  let asset: CachedPriceI;

  it('인메모리에 없는경우 (010)', () => {
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

  it('인메모리에 있고 최신인 경우 (100)', () => {
    return request(app.getHttpServer())
      .post(`/dev/price/${SYMBOL}`)
      .expect(200)
      .expect(res => {
        const body = res.body;
        expect(marketApiService.fetchPriceByTicker).toBeCalledTimes(0);
        expect(priceService.read_with_counting).toBeCalledTimes(1);
        expect(body).toHaveProperty('price', asset.price);
        expect(body).toHaveProperty('ISO_Code', asset.ISO_Code);
        expect(body).toHaveProperty('currency', asset.currency);
        expect(body).toHaveProperty('marketDate', asset.marketDate);
        expect(body).toHaveProperty('count', 2);
      });
  });

  it('인메모리에 있지만 최신 아닌 경우 (101)', async () => {
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
        expect(marketApiService.fetchPriceByTicker).toBeCalledTimes(1);
        expect(priceService.read_with_counting).toBeCalledTimes(1);
        expect(priceService.update).toBeCalledTimes(1);
        expect(body).toHaveProperty('price', asset.price);
        expect(body).toHaveProperty('ISO_Code', asset.ISO_Code);
        expect(body).toHaveProperty('currency', asset.currency);
        expect(body).toHaveProperty('marketDate', asset.marketDate);
        expect(body).toHaveProperty('count', 3);
      });
  });
});