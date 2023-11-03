import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { AssetService as MkAssetService } from 'src/market/asset/asset.service';
import { ExchangeService as DbExchangeService } from "src/database/exchange/exchange.service";
import { Yf_infoService as DbYfInfoService } from "src/database/yf_info/yf_info.service";
import { FinancialAssetService as DbFinancialAssetService } from "src/database/financialAsset/financialAsset.service";
import { UpdaterService } from "src/updater/updater.service";
import { AssetService } from "./asset.service";
import { mockApple, mockSamsungElec } from "src/database/mock";
import { ResponseGetPriceByTicker } from "./response/getPriceByTicker.response";
import { AddAssetsResponse } from "./response/addAssets.response";
import { InternalServerErrorException, NotFoundException } from "@nestjs/common";

class MockMkAssetService {}
class MockDbExchangeService {}
class MockDbYfInfoService {}
class MockDbFinancialAssetService {
  public readOneByPk(ticker: string) {
    if (ticker === mockApple.symbol) return Promise.resolve(mockApple);
    else return Promise.resolve(null);
  }
}
class MockUpdaterService {}

describe('AssetService', () => {
  let service: AssetService;
  let dbFinAssetSrv: DbFinancialAssetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ envFilePath: ".env" })],
      providers: [
        { provide: MkAssetService, useClass: MockMkAssetService },
        { provide: DbExchangeService, useClass: MockDbExchangeService },
        { provide: DbYfInfoService, useClass: MockDbYfInfoService },
        { provide: DbFinancialAssetService, useClass: MockDbFinancialAssetService },
        { provide: UpdaterService, useClass: MockUpdaterService },
        AssetService
      ],
    }).compile();

    service = module.get<AssetService>(AssetService);
    dbFinAssetSrv = module.get<DbFinancialAssetService>(DbFinancialAssetService);
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
      readOneByPkSpy = jest.spyOn(dbFinAssetSrv, "readOneByPk");
      addAssetsSpy = jest.spyOn(service, "addAssets");
    });

    it('dbFinAsset 에 있음', async () => {
      const res = await service.getPriceByTicker(mockApple.symbol);
      expect(res).toEqual(new ResponseGetPriceByTicker(mockApple));
      expect(readOneByPkSpy).toBeCalledTimes(1);
      expect(addAssetsSpy).toBeCalledTimes(0);
    });

    it('dbFinAsset 에 없고 addAssets 으로 Asset 생성함', async () => {
      jest.spyOn(service, "addAssets").mockResolvedValueOnce(new AddAssetsResponse(
        [], [], [], [mockSamsungElec]
      ));
      const res = await service.getPriceByTicker(mockSamsungElec.symbol);
      expect(res).toEqual(new ResponseGetPriceByTicker(mockSamsungElec));
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
      jest.spyOn(service, "addAssets").mockResolvedValueOnce(addAssetsRes1);
      expect(service.getPriceByTicker(mockSamsungElec.symbol)).rejects
      .toThrow(new NotFoundException(`Could not find Ticker: ${mockSamsungElec.symbol}`));
      
      const addAssetsRes2 = new AddAssetsResponse([], [], [], []);
      jest.spyOn(service, "addAssets").mockResolvedValueOnce(addAssetsRes2);
      expect(service.getPriceByTicker(mockSamsungElec.symbol)).rejects
      .toThrow(new InternalServerErrorException(addAssetsRes2));
    });
  });

  describe('addAssets', () => {
    it.todo('전부 이미 존재하는경우');
    it.todo('생성');
    it.todo('생성 + 새로운 Exchange 생성');
  });

});