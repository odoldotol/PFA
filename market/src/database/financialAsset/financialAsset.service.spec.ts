import { ConfigModule, ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { Exchange } from "../exchange/exchange.entity";
import { Database_ExchangeService as ExchangeService } from "../exchange/exchange.service";
import { 
  mockKoreaExchange,
  mockNewYorkStockExchange,
  mockApple,
  mockSamsungElec,
  mockUsaTreasuryYield10y
} from "src/mock";
import { TypeOrmConfigService } from "../postgres/typeormConfig.service";
import { FinancialAsset } from "./financialAsset.entity";
import { Database_FinancialAssetService as FinancialAssetService } from "./financialAsset.service";

// 도커 컨테이너 처음 만들면서 테스트시 타임아웃 걸리는 경우 종종 있음. 컨테이너의 health 체킹 이후에 테스트를 실행하면 될것같음.
// 우선 임시로 시간 늘림.
jest.setTimeout(10000);

/* TypeOrmModule 에러
Jest 병열 + synchronize: true 가 문제를 일으키는것?
테스트에는 문제 없을 것 같지만 그래도 나중에 에러 잡아보기.
*/
describe('FinancialAssetsService', () => {
  let service: FinancialAssetService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({
          imports: [
            ConfigModule.forRoot()
          ],
          useClass: TypeOrmConfigService,
          inject: [ConfigService]
        }),
        TypeOrmModule.forFeature([FinancialAsset]),
        TypeOrmModule.forFeature([Exchange])
      ],
      providers: [
        ExchangeService,
        FinancialAssetService
      ],
    }).compile();

    service = module.get<FinancialAssetService>(FinancialAssetService);
    dataSource = module.get<DataSource>(DataSource);
    
    const exchangeSrv = module.get<ExchangeService>(ExchangeService)
    await exchangeSrv.createOne(mockKoreaExchange);
    await exchangeSrv.createOne(mockNewYorkStockExchange);
  });

  afterEach(async () => {
    await dataSource.dropDatabase();
    await dataSource.destroy();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createMany', () => {
    it('should create records in financial_assets table', async () => {
      const values = [mockApple, mockSamsungElec, mockUsaTreasuryYield10y];
      const result = await service.createMany(values);
      const queryResult = await dataSource.query('SELECT * FROM financial_assets');
      expect(result).toEqual(values);
      expect(queryResult.length).toBe(3);
    });

    it('should create if nullable property is undefined', async () => {
      const values = [{
          symbol: mockApple.symbol,
          quoteType: mockApple.quoteType,
          shortName: mockApple.shortName,
          longName: undefined,
          exchange: undefined,
          currency: mockApple.currency,
          regularMarketLastClose: mockApple.regularMarketLastClose
        }];
      const result = await service.createMany(values);
      const queryResult = await dataSource.query('SELECT * FROM financial_assets');
      expect(result).toEqual(values);
      expect(queryResult[0]).toEqual({
        symbol: mockApple.symbol,
        quotetype: mockApple.quoteType,
        shortname: mockApple.shortName,
        longname: null,
        exchange: null,
        currency: mockApple.currency,
        regularmarketlastclose: mockApple.regularMarketLastClose
      });
    });

    it('should return empty Array if values is empty', async () => {
      const result = await service.createMany([]);
      expect(result).toEqual([]);
    });
  });

  describe('existByPk', () => {
    it('should return boolean if exist or not by primary key', async () => {
      expect(await service.existByPk(mockApple.symbol)).toBe(false);
      await service.createMany([mockApple]);
      expect(await service.existByPk(mockApple.symbol)).toBe(true);
    });
  });

  describe('readManyByEqualComparison', () => {
    it('should return records matched by equal comparison', async () => {
      await service.createMany([mockApple, mockSamsungElec, mockUsaTreasuryYield10y]);
      const result = await service.readManyByEqualComparison({
        exchange: mockApple.exchange,
        currency: mockApple.currency
      });
      expect(result).toEqual([mockApple, mockUsaTreasuryYield10y]);
    });
  });

  describe('readOneByPk', () => {
    it('should return a record by primary key', async () => {
      await service.createMany([mockApple, mockSamsungElec, mockUsaTreasuryYield10y]);
      const result = await service.readOneByPk(mockSamsungElec.symbol);
      expect(result).toEqual(mockSamsungElec);
    });

    it('should return null if not exist', async () => {
      const result = await service.readOneByPk(mockSamsungElec.symbol);
      expect(result).toBe(null);
    });
  });

  describe('readSymbolsByExchange', () => {
    it('should return Array of symbol by exchange', async () => {
      await service.createMany([mockApple, mockSamsungElec, mockUsaTreasuryYield10y]);
      const result = await service.readSymbolsByExchange(mockApple.exchange);
      expect(result).toEqual([mockApple.symbol, mockUsaTreasuryYield10y.symbol]);
    });

    it.todo('exchange 가 null 인 경우');
  });

  describe('readManyByExchange', () => {
    it('should return records by exchange', async () => {
      await service.createMany([mockApple, mockSamsungElec, mockUsaTreasuryYield10y]);
      const result = await service.readManyByExchange(mockApple.exchange);
      expect(result).toEqual([mockApple, mockUsaTreasuryYield10y]);
    });

    it.todo('exchange 가 null 인 경우');
  });

  describe('updatePriceMany', () => {
    it('should update regularMarketLastClose', async () => {
      await service.createMany([mockApple, mockSamsungElec, mockUsaTreasuryYield10y]);
      await service.updatePriceMany([
        {
          symbol: mockApple.symbol,
          regularMarketLastClose: 777
        },
        {
          symbol: mockSamsungElec.symbol,
          regularMarketLastClose: 77777
        },
      ]);
      const result = await service.readManyByEqualComparison({ quoteType: "EQUITY" });
      expect(result).toEqual([
        {
          ...mockApple,
          regularMarketLastClose: 777
        },
        {
          ...mockSamsungElec,
          regularMarketLastClose: 77777
        }
      ]);
    });
    
    it.todo('should return { symbol, regularMarketLastClose } of updated records');
    
    it('should return empty Array if updateArr is empty', async () => {
      const result = await service.updatePriceMany([]);
      expect(result).toEqual([]);
    });
  });

});