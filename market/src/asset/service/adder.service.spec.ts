import { Test, TestingModule } from "@nestjs/testing";
import { AdderService } from "./adder.service";
import { Market_FinancialAssetService } from 'src/market/financialAsset/financialAsset.service';
import { YfinanceInfoService } from "src/database/yf_info/yf_info.service";
import { Database_FinancialAssetService } from "src/database/financialAsset/financialAsset.service";
import { mockSamsungElec } from "src/mock";
import { AddAssetsResponse } from "../response/addAssets.response";
import { YfInfo } from "src/common/interface";
import Either, * as E from "src/common/class/either";

describe('AdderService', () => {
  let service: AdderService;
  let market_financialAssetSrv: Market_FinancialAssetService;
  let database_financialAssetSrv: Database_FinancialAssetService;
  let yfinanceInfoSrv: YfinanceInfoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: Market_FinancialAssetService, useValue: {} },
        { provide: YfinanceInfoService, useValue: {} },
        { provide: Database_FinancialAssetService, useValue: {} },
        AdderService
      ],
    }).compile();

    service = module.get<AdderService>(AdderService);
    market_financialAssetSrv = module.get<Market_FinancialAssetService>(Market_FinancialAssetService);
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
      market_financialAssetSrv.fetchYfInfosByEitherTickerArr = jest.fn(eitherTickerArr => {
        return Promise.all(eitherTickerArr.map(eitherTicker => E.flatMap(_ => Either.right({} as YfInfo))(eitherTicker)));
      });
      yfinanceInfoSrv.insertMany = jest.fn().mockResolvedValue(Either.right([]));
      market_financialAssetSrv.fulfillYfInfo = jest.fn().mockReturnValue({});
      database_financialAssetSrv.createMany = jest.fn().mockResolvedValue([]);
    });
    
    // 현재 주된 역할은 하나의 ticker 에 대한 처리임.
    describe('addAssetsFromFilteredTickers - 하나의 right ticker 에 대한 처리', () => {
      it('fetch 에러', () => {
        market_financialAssetSrv.fetchYfInfosByEitherTickerArr = jest.fn().mockResolvedValueOnce([Either.left({msg: 'fetch error'})]);
        const result = service.addAssetsFromFilteredTickers([Either.right(mockSamsungElec.symbol)]);
        expect(result).resolves.toEqual(new AddAssetsResponse([{msg: 'fetch error'}], Either.right([]), Either.right([])));
      });

      it.todo('yf_info 생성');
      it.todo('newExchange 생성');

      it('financialAsset 생성', () => {
        database_financialAssetSrv.createMany = jest.fn().mockResolvedValueOnce([mockSamsungElec]);
        const result = service.addAssetsFromFilteredTickers([Either.right(mockSamsungElec.symbol)]);
        expect(result).resolves.toEqual(new AddAssetsResponse([], Either.right([]), Either.right([mockSamsungElec])));
      });
    });
  });

});