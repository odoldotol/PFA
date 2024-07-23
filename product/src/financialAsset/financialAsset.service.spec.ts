import { Test } from "@nestjs/testing";
import { FinancialAssetService } from "./financialAsset.service";
import { FinancialAssetConfigService } from "src/config";
import {
  FinancialAssetRedisEntity,
  MarketDateRedisEntity
} from "./redisEntity";
import { REDIS_REPOSITORY_TOKEN_SUFFIX } from "src/database/redis/const";
import { MarketApiService } from "src/marketApi";
import { mockAppleTicker } from "src/mock";
import { mockAssetsFromMarketMap, mockNewYorkStockExchangeIsoCode } from "test/mock";
import { RedisRepository } from "src/database";
import { FinancialAssetCore } from "src/common/interface";
import * as F from "@fxts/core";

describe('FinancialAssetService', () => {
  let
  service: FinancialAssetService,
  financialAssetRepo: RedisRepository<FinancialAssetCore>,
  marketApiSrv: MarketApiServiceMock;

  let
  fetch: jest.SpyInstance,
  read: jest.SpyInstance,
  count: jest.SpyInstance,
  inquireRaw: jest.SpyInstance,
  renewExchangeRaw: jest.SpyInstance;

  beforeAll(async () => {
    const module = await moduleBuilder.compile();
    service = module.get(FinancialAssetService);
    financialAssetRepo = module.get(financialAssetRepoInjectionToken);
    marketApiSrv = module.get(MarketApiService);

    fetch = jest.spyOn(marketApiSrv, 'fetchFinancialAsset');
    read = jest.spyOn(financialAssetRepo, 'findOne');
    count = jest.spyOn(financialAssetRepo, 'count');
    inquireRaw = jest.spyOn(service as any, 'inquireRaw');
    renewExchangeRaw = jest.spyOn(service as any, 'renewExchangeRaw');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it.todo('onModuleInit');

  it.todo('renew');

  describe('inquire', () => {
    it.todo('FinancialAsset 을 리턴해야함.');
    it.todo('캐싱이용. 생성, 업뎃, 조회.');

    it('같은 Ticker 에 대해서 동시요청은 일괄처리 해야함. 모든 inquire 를 count 해야함.', async () => {
      const res1 = service.inquire(mockAppleTicker);
      const res2 = service.inquire(mockAppleTicker);
      const res3 = service.inquire(mockAppleTicker);
      const res4 = service.inquire(mockAppleTicker);

      expect(await res1).toBe(await res2);
      expect(await res1).toBe(await res3);
      expect(await res1).toBe(await res4);

      expect(fetch).toBeCalledTimes(1);
      expect(read).toBeCalledTimes(1);

      expect(count).toBeCalledTimes(4);
    });

    it.todo('캐시생성, 업뎃과 관계없이 리턴해야함.');
  });

  describe('renew 와 inquire 는 같은 Ticker 에 대해 동시에 작업하지 않아야함.', () => {
    it('renew 는 해당하는 Ticker 에 대한 inquire 를 기다리고 시작해야함.', async () => {
      const inquire = service.inquire(mockAppleTicker);
      const renew = service.renewExchange({
        isoCode: mockNewYorkStockExchangeIsoCode,
        marketDate: '1990-03-25'
      }, [ [ mockAppleTicker, 777, 77 ] ]);

      expect(inquireRaw).toBeCalledTimes(1);
      expect(renewExchangeRaw).toBeCalledTimes(0);

      await inquire;
      expect(renewExchangeRaw).toBeCalledTimes(1);

      await renew;
    });

    it('inquire 는 해당하는 Ticker 에 대한 renew 를 기다리고 시작해야함.', async () => {
      const renew = service.renewExchange({isoCode: mockNewYorkStockExchangeIsoCode, marketDate: '1990-03-25'}, [[mockAppleTicker, 777, 77]]);
      const inquire = service.inquire(mockAppleTicker);

      expect(renewExchangeRaw).toBeCalledTimes(1);
      expect(inquireRaw).toBeCalledTimes(0);

      await renew;
      expect(inquireRaw).toBeCalledTimes(1);

      await inquire;
    });
  });
});

const TEST_RENEWAL_THRESHOLD = 1;

class FinancialAssetConfigServiceMock {
  getRenewalThreshold = jest.fn().mockReturnValue(TEST_RENEWAL_THRESHOLD);
}

class financialAssetRepositoryMock {
  findOne = jest.fn().mockImplementation(async () => {
    await F.delay(100);
    return {
      count: jest.fn(),
      save: jest.fn(),
    }
  });
  createOne = jest.fn();
  deleteOne = jest.fn();

  count = jest.fn();
  getCount = jest.fn();
  resetCount = jest.fn();
}

class MarketDateRepositoryMock {
  findOne = jest.fn();
  updateOrCreateOne = jest.fn();
}

class MarketApiServiceMock {
  fetchFinancialAsset = jest.fn().mockImplementation(async () => {
    await F.delay(100);
    return mockAssetsFromMarketMap.get(mockAppleTicker);
  });
}

const financialAssetRepoInjectionToken = FinancialAssetRedisEntity.name + REDIS_REPOSITORY_TOKEN_SUFFIX;
const marketDateRepoInjectionToken = MarketDateRedisEntity.name + REDIS_REPOSITORY_TOKEN_SUFFIX;

const moduleBuilder = Test.createTestingModule({
  providers: [
    {
      provide: FinancialAssetConfigService,
      useClass: FinancialAssetConfigServiceMock,
    },
    {
      provide: financialAssetRepoInjectionToken,
      useClass: financialAssetRepositoryMock,
    },
    {
      provide: marketDateRepoInjectionToken,
      useClass: MarketDateRepositoryMock
    },
    {
      provide: MarketApiService,
      useClass: MarketApiServiceMock
    },
    FinancialAssetService
  ],
});