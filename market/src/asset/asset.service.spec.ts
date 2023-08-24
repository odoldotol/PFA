import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { DBRepository } from "src/database/database.repository";
import { AssetService as MkAssetService } from 'src/market/asset/asset.service';
import { ExchangeService as DbExchangeService } from "src/database/exchange/exchange.service";
import { Yf_infoService as DbYfInfoService } from "src/database/yf_info/yf_info.service";
import { ExchangeService as MkExchangeService } from "src/market/exchange/exchange.service";
import { UpdaterService } from "src/updater/updater.service";
import { AssetService } from "./asset.service";

class MockMkAssetService {}
class MockMkExchangeService {}
class MockDbExchangeService {}
class MockDbYfInfoService {}
class MockUpdaterService {}
class DBRepositoryMock {}

describe('AssetService', () => {
  let service: AssetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ envFilePath: ".env" })],
      providers: [
        { provide: MkAssetService, useClass: MockMkAssetService },
        { provide: MkExchangeService, useClass: MockMkExchangeService },
        { provide: DbExchangeService, useClass: MockDbExchangeService },
        { provide: DbYfInfoService, useClass: MockDbYfInfoService },
        { provide: UpdaterService, useClass: MockUpdaterService },
        { provide: DBRepository, useClass: DBRepositoryMock },
        AssetService
      ],
    }).compile();

    service = module.get<AssetService>(AssetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPriceByTicker', () => {
    it.todo('db 에서 조회');
    it.todo('없으면 생성');
    it.todo('응답 객체');
  });

});