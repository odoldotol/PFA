import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import {
  Database_FinancialAssetService
} from "src/database/financialAsset/financialAsset.service";
import { AccessorService } from "./accessor.service";
import { AdderService } from "./adder.service";
import { AddAssetsResponse } from "../response/addAssets.response";
import Either from "src/common/class/either";
import { Ticker } from "src/common/interface";
import { mockApple, mockSamsungElec } from "src/mock";

describe('AccessorService', () => {
  let service: AccessorService;
  let database_financialAssetSrv: Database_FinancialAssetService;
  let adderSrv: AdderService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: Database_FinancialAssetService, useValue: {} },
        { provide: AdderService, useValue: {} },
        AccessorService
      ],
    }).compile();

    service = module.get(AccessorService);
    database_financialAssetSrv = module.get(Database_FinancialAssetService);
    adderSrv = module.get(AdderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPriceByTicker', () => {
    beforeAll(() => {
      database_financialAssetSrv.readOneByPk = jest.fn()
      .mockImplementation((ticker: Ticker) => {
        if (ticker === mockApple.symbol) return Promise.resolve(mockApple);
        else return Promise.resolve(null);
      });
    });

    it('database_financialAssetSrv 에서 가져올 수 있음', async () => {
      const res = await service.getPriceByTicker(mockApple.symbol);
      expect(res).toEqual(mockApple);
    });

    it('database_financialAssetSrv 에서 가져올 수 없음', async () => {
      const res = await service.getPriceByTicker(mockSamsungElec.symbol);
      expect(res).toEqual(null);
    });
  });

  describe('addPriceByTicker', () => {
    beforeAll(() => {
      adderSrv.addAssetsFromFilteredTickers = jest.fn()
      .mockImplementation(async (
        eitherTickerArr: readonly Either<any, string>[]
      ): Promise<AddAssetsResponse> => {
        if (eitherTickerArr[0]!.right === mockSamsungElec.symbol) {
          return new AddAssetsResponse(
            [], Either.right([]), Either.right([mockSamsungElec])
          );
        } else {
          return new AddAssetsResponse([{
            doc: "Mapping key not found.",
            ticker: eitherTickerArr[0]!.right
          }], Either.right([]), Either.right([]));
        }
      });
    });

    it('정상적으로 Asset 추가됨', async () => {
      const res = await service.addPriceByTicker(mockSamsungElec.symbol);
      expect(res).toEqual(mockSamsungElec);
    });

    it('Asset 을 추가할 수 없음. Not Found.', async () => {
      const notFoundTicker = "notFoundTicker";
      expect(service.addPriceByTicker(notFoundTicker)).rejects
      .toThrow(new NotFoundException(`Could not find Ticker: ${notFoundTicker}`));
    });
  });
});