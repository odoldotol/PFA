import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from '../postgres/typeormConfig.service';
import { Exchange } from './exchange.entity';
import { Database_ExchangeService as ExchangeService } from './exchange.service';
import { DataSource } from 'typeorm';
import { mockKoreaExchange, mockNewYorkStockExchange } from 'src/mock';

/* TypeOrmModule 에러
Jest 병열 + synchronize: true 가 문제를 일으키는것?
테스트에는 문제 없을 것 같지만 그래도 나중에 에러 잡아보기.
*/
describe('ExchangeService', () => {
  let service: ExchangeService;
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
        TypeOrmModule.forFeature([Exchange])
      ],
      providers: [ExchangeService],
    }).compile();

    service = module.get<ExchangeService>(ExchangeService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(async () => {
    await dataSource.dropDatabase();
    await dataSource.destroy();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOne', () => {
    it('should create a record in exchanges table', async () => {
      await service.createOne(mockKoreaExchange);
      const result = await dataSource.query('SELECT * FROM exchanges');
      expect(result[0]).toEqual({
        iso_code: mockKoreaExchange.isoCode,
        iso_timezonename: mockKoreaExchange.isoTimezoneName,
        marketdate: mockKoreaExchange.marketDate,
      });
    });

    it('should return the created record', async () => {
      const result = await service.createOne(mockKoreaExchange);
      expect(result).toEqual(mockKoreaExchange);
    });
  });

  describe('exist', () => {
    it('should return boolean if exist or not', async () => {
      expect(await service.exist({ isoCode: mockKoreaExchange.isoCode })).toBe(false);
      await service.createOne(mockKoreaExchange);
      expect(await service.exist({ isoCode: mockKoreaExchange.isoCode })).toBe(true);
    });
  });

  describe('readAll', () => {
    it('should return all records in exchanges table', async () => {
      await service.createOne(mockKoreaExchange);
      await service.createOne(mockNewYorkStockExchange);
      const result = await service.readAll();
      expect(result).toEqual([mockKoreaExchange, mockNewYorkStockExchange]);
    });
  });

  describe('readOneByPk', () => {
    it('should return a record by primary key', async () => {
      await service.createOne(mockKoreaExchange);
      await service.createOne(mockNewYorkStockExchange);
      const result = await service.readOneByPk(mockKoreaExchange.isoCode);
      expect(result).toEqual(mockKoreaExchange);
    });
  });

  describe('updateMarketDateByPk', () => {
    it('should update marketDate of a record found by primary key', async () => {
      await service.createOne(mockKoreaExchange);
      const marketDate = '2023-07-04';
      await service.updateMarketDateByPk(mockKoreaExchange.isoCode, marketDate);
      const result = await service.readOneByPk(mockKoreaExchange.isoCode);
      expect(result).toEqual(Object.assign(mockKoreaExchange, { marketDate }));
    });
  });

});