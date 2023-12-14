import { InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { Database_FinancialAssetService } from "src/database/financialAsset/financialAsset.service";
import { AccessorService } from "./accessor.service";
import { AdderService } from "./adder.service";
import { mockApple, mockSamsungElec } from "src/mock";
import { GetPriceByTickerResponse } from "../response/getPriceByTicker.response";
import { AddAssetsResponse } from "../response/addAssets.response";
import Either from "src/common/class/either";

describe('AccessorService', () => {
  let service: AccessorService;
  let database_financialAssetSrv: Database_FinancialAssetService;
  let adderSrv: AdderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: Database_FinancialAssetService, useValue: {} },
        { provide: AdderService, useValue: {} },
        AccessorService
      ],
    }).compile();

    service = module.get<AccessorService>(AccessorService);
    database_financialAssetSrv = module.get<Database_FinancialAssetService>(Database_FinancialAssetService);
    adderSrv = module.get<AdderService>(AdderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPriceByTicker', () => {
    let readOneByPkSpy: jest.SpyInstance;
    let addAssetsSpy: jest.SpyInstance;

    beforeEach(() => {
      database_financialAssetSrv.readOneByPk = jest.fn().mockImplementation((ticker: string) => {
        if (ticker === mockApple.symbol) return Promise.resolve(mockApple);
        else return Promise.resolve(null);
      });
      adderSrv.addAssetsFromFilteredTickers = jest.fn();
      readOneByPkSpy = jest.spyOn(database_financialAssetSrv, "readOneByPk");
      addAssetsSpy = jest.spyOn(adderSrv, "addAssetsFromFilteredTickers");
    });

    it('database_financialAssetSrv 에서 가져올 수 있음', async () => {
      const res = await service.getPriceByTicker(mockApple.symbol);
      expect(res).toEqual(new GetPriceByTickerResponse(mockApple));
      expect(readOneByPkSpy).toBeCalledTimes(1);
      expect(addAssetsSpy).toBeCalledTimes(0);
    });

    describe('database_financialAssetSrv 에서 가져올 수 없고 adderSrv 에서 Asset 추가', () => {
      it('정상적으로 Asset 추가됨', async () => {
        jest.spyOn(adderSrv, "addAssetsFromFilteredTickers")
        .mockResolvedValueOnce(new AddAssetsResponse(
          [], Either.right([]), Either.right([mockSamsungElec])
        ));
        const res = await service.getPriceByTicker(mockSamsungElec.symbol);
        expect(res).toEqual(new GetPriceByTickerResponse(mockSamsungElec));
        expect(readOneByPkSpy).toBeCalledTimes(1);
        expect(addAssetsSpy).toBeCalledTimes(1);
      });

      it.todo('새로운 Exchange 생성과 함께 정상적으로 Asset 추가됨');
      it.todo('새로운 Exchange 생성이 필요하나 실패했고 Asset 은 추가됨');
      
      it('Asset 을 추가할 수 없음', async () => {
        const addAssetsRes1 = new AddAssetsResponse([{
          doc: "Mapping key not found.",
          ticker: mockSamsungElec.symbol
        }], Either.right([]), Either.right([]));
        jest.spyOn(adderSrv, "addAssetsFromFilteredTickers")
        .mockResolvedValueOnce(addAssetsRes1);
        expect(service.getPriceByTicker(mockSamsungElec.symbol)).rejects
        .toThrow(new NotFoundException(`Could not find Ticker: ${mockSamsungElec.symbol}`));
        
        const addAssetsRes2 = new AddAssetsResponse([], Either.right([]), Either.right([]));
        jest.spyOn(adderSrv, "addAssetsFromFilteredTickers")
        .mockResolvedValueOnce(addAssetsRes2);
        expect(service.getPriceByTicker(mockSamsungElec.symbol)).rejects
        .toThrow(new InternalServerErrorException(addAssetsRes2));
      });
    });
  });

});