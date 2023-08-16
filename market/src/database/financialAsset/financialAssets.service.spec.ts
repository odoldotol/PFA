import { ConfigModule, ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import postgresConfig from "src/config/postgres.config";
import { DataSource } from "typeorm";
import { Exchange } from "../exchange/exchange.entity";
import { ExchangeService } from "../exchange/exchange.service";
import { mockKoreaExchange, mockNewYorkStockExchange } from "../exchange/mock/exchange.mock";
import { TypeOrmConfigService } from "../postgres/typeormConfig.service";
import { FinancialAsset } from "./financialAsset.entity";
import { FinancialAssetService } from "./financialAsset.service";
import { mockApple, mockSamsungElec, mockUsaTreasuryYield10y } from "./mock/asset.mock";

describe('FinancialAssetsService', () => {
  let service: FinancialAssetService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({
          imports: [
            ConfigModule.forRoot({
              load: [postgresConfig]
            })
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
      await service.createMany([
        mockApple,
        mockSamsungElec,
        mockUsaTreasuryYield10y
      ]);
      const result = await dataSource.query('SELECT * FROM financial_assets');
      expect(result.length).toBe(3);
    });

    it('should create if nullable property is undefined', async () => {
      await service.createMany([
        {
          symbol: mockApple.symbol,
          quoteType: mockApple.quoteType,
          shortName: mockApple.shortName,
          currency: mockApple.currency,
          regularMarketLastClose: mockApple.regularMarketLastClose
        }
      ]);
      const result = await dataSource.query('SELECT * FROM financial_assets');
      expect(result[0]).toEqual({
        symbol: mockApple.symbol,
        quotetype: mockApple.quoteType,
        shortname: mockApple.shortName,
        longname: null,
        exchange: null,
        currency: mockApple.currency,
        regularmarketlastclose: mockApple.regularMarketLastClose
      });
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
  });

  describe('readSymbolsByExchange', () => {
    it('should return Array of symbol by exchange', async () => {
      await service.createMany([mockApple, mockSamsungElec, mockUsaTreasuryYield10y]);
      const result = await service.readSymbolsByExchange(mockApple.exchange);
      expect(result).toEqual([mockApple.symbol, mockUsaTreasuryYield10y.symbol]);
    });
  });

  describe('readManyByExchange', () => {
    it('should return records by exchange', async () => {
      await service.createMany([mockApple, mockSamsungElec, mockUsaTreasuryYield10y]);
      const result = await service.readManyByExchange(mockApple.exchange);
      expect(result).toEqual([mockApple, mockUsaTreasuryYield10y]);
    });
  });

});