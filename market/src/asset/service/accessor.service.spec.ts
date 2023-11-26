import { InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { Database_FinancialAssetService } from "src/database/financialAsset/financialAsset.service";
import { AccessorService } from "./accessor.service";
import { AdderService } from "./adder.service";
import { mockApple, mockSamsungElec } from "src/database/mock";
import { GetPriceByTickerResponse } from "../response/getPriceByTicker.response";
import { AddAssetsResponse } from "../response/addAssets.response";

class MockDatabase_FinancialAssetService {
  public readOneByPk(ticker: string) {
    if (ticker === mockApple.symbol) return Promise.resolve(mockApple);
    else return Promise.resolve(null);
  }
}
class MockAdderService {
  public addAssets(tickerArr: string[]) {}
}

describe('AccessorService', () => {
  let service: AccessorService;
  let database_financialAssetSrv: Database_FinancialAssetService;
  let adderSrv: AdderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: Database_FinancialAssetService, useClass: MockDatabase_FinancialAssetService },
        { provide: AdderService, useClass: MockAdderService },
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
      readOneByPkSpy = jest.spyOn(database_financialAssetSrv, "readOneByPk");
      addAssetsSpy = jest.spyOn(adderSrv, "addAssets");
    });

    it('dbFinAsset 에 있음', async () => {
      const res = await service.getPriceByTicker(mockApple.symbol);
      expect(res).toEqual(new GetPriceByTickerResponse(mockApple));
      expect(readOneByPkSpy).toBeCalledTimes(1);
      expect(addAssetsSpy).toBeCalledTimes(0);
    });

    it('dbFinAsset 에 없고 addAssets 으로 Asset 생성함', async () => {
      jest.spyOn(adderSrv, "addAssets").mockResolvedValueOnce(new AddAssetsResponse(
        [], [], [], [mockSamsungElec]
      ));
      const res = await service.getPriceByTicker(mockSamsungElec.symbol);
      expect(res).toEqual(new GetPriceByTickerResponse(mockSamsungElec));
      expect(readOneByPkSpy).toBeCalledTimes(1);
      expect(addAssetsSpy).toBeCalledTimes(1);
    });

    it.todo('? dbFinAsset 에 없고 addAssets 으로 Asset 생성함 + (새로운 Exchange 생성됨');
    it.todo('? dbFinAsset 에 없고 addAssets 으로 Asset 생성함 + (새로운 Exchange 생성 실패함');

    it('dbFinAsset 에 없고 addAssets 으로 생성 실패함', async () => {
      const addAssetsRes1 = new AddAssetsResponse([{
        doc: "Mapping key not found.",
        ticker: mockSamsungElec.symbol
      }], [], [], []);
      jest.spyOn(adderSrv, "addAssets").mockResolvedValueOnce(addAssetsRes1);
      expect(service.getPriceByTicker(mockSamsungElec.symbol)).rejects
      .toThrow(new NotFoundException(`Could not find Ticker: ${mockSamsungElec.symbol}`));
      
      const addAssetsRes2 = new AddAssetsResponse([], [], [], []);
      jest.spyOn(adderSrv, "addAssets").mockResolvedValueOnce(addAssetsRes2);
      expect(service.getPriceByTicker(mockSamsungElec.symbol)).rejects
      .toThrow(new InternalServerErrorException(addAssetsRes2));
    });
  });

});