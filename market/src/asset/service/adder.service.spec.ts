import { Test, TestingModule } from "@nestjs/testing";
import { AdderService } from "./adder.service";
import { Market_FinancialAssetService } from 'src/market/financialAsset/financialAsset.service';
import { MarketService } from "src/market/market.service";
import { Database_ExchangeService } from "src/database/exchange/exchange.service";
import { YfinanceInfoService } from "src/database/yf_info/yf_info.service";
import { Database_FinancialAssetService } from "src/database/financialAsset/financialAsset.service";
import { UpdaterService } from "src/asset/service/updater.service";
import { mockApple, mockSamsungElec } from "src/mock";
import { Either, eitherFlatMap } from "src/common/class/either";
import { AddAssetsResponse } from "../response/addAssets.response";
import { TYfInfo } from "src/market/type";

describe('AdderService', () => {
  let service: AdderService;
  let market_financialAssetSrv: Market_FinancialAssetService;
  let marketSrv: MarketService;
  let database_financialAssetSrv: Database_FinancialAssetService;
  let yfinanceInfoSrv: YfinanceInfoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: Market_FinancialAssetService, useValue: {} },
        { provide: MarketService, useValue: {} },
        { provide: Database_ExchangeService, useValue: {} },
        { provide: YfinanceInfoService, useValue: {} },
        { provide: Database_FinancialAssetService, useValue: {} },
        { provide: UpdaterService, useValue: {} },
        AdderService
      ],
    }).compile();

    service = module.get<AdderService>(AdderService);
    market_financialAssetSrv = module.get<Market_FinancialAssetService>(Market_FinancialAssetService);
    marketSrv = module.get<MarketService>(MarketService);
    database_financialAssetSrv = module.get<Database_FinancialAssetService>(Database_FinancialAssetService);
    yfinanceInfoSrv = module.get<YfinanceInfoService>(YfinanceInfoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addAssets', () => {

    beforeEach(() => {
      database_financialAssetSrv.existByPk = jest.fn(async ticker => {
        return ticker === mockApple.symbol ? true : false;
      });
      market_financialAssetSrv.fetchYfInfosByEitherTickerArr = jest.fn(eitherTickerArr => {
        return Promise.all(eitherTickerArr.map(eitherTicker => eitherFlatMap(_ => Either.right({} as TYfInfo))(eitherTicker)));
      });
      yfinanceInfoSrv.insertMany = jest.fn().mockResolvedValue(Either.right([]));
      marketSrv.fulfillYfInfo = jest.fn().mockReturnValue({});
      database_financialAssetSrv.createMany = jest.fn().mockResolvedValue([]);
    });
    
    // 현재 주된 역할은 하나의 ticker 에 대한 처리임.
    describe('하나의 ticker 에 대한 처리', () => {
      it('이미 database_financialAssetSrv 에서 availabe', () => {
        const result = service.addAssets([mockApple.symbol]);
        expect(result).resolves.toEqual(new AddAssetsResponse([{msg:"Already exists", ticker: mockApple.symbol}], [], []));
      });

      it('fetch 에러', () => {
        market_financialAssetSrv.fetchYfInfosByEitherTickerArr = jest.fn().mockResolvedValueOnce([Either.left({msg: 'fetch error'})]);
        const result = service.addAssets([mockSamsungElec.symbol]);
        expect(result).resolves.toEqual(new AddAssetsResponse([{msg: 'fetch error'}], [], []));
      });

      it.todo('yf_info 생성');
      it.todo('newExchange 생성');

      it('financialAsset 생성', () => {
        database_financialAssetSrv.createMany = jest.fn().mockResolvedValueOnce([mockSamsungElec]);
        const result = service.addAssets([mockSamsungElec.symbol]);
        expect(result).resolves.toEqual(new AddAssetsResponse([], [], [mockSamsungElec]));
      });
    });
  });

});