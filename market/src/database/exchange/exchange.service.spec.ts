import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import postgresConfig from 'src/config/postgres.config';
import { TypeOrmConfigService } from '../postgres/typeormConfig.service';
import { Exchange } from './exchange.entity';
import { ExchangeService } from './exchange.service';
import { DataSource } from 'typeorm';
import { mockKoreaExchange } from './mock/exchange.mock';

describe('ExchangeService', () => {
  let service: ExchangeService;
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
        iso_code: mockKoreaExchange.ISO_Code,
        iso_timezonename: mockKoreaExchange.ISO_TimezoneName,
        marketdate: mockKoreaExchange.marketDate,
        yf_exchangename: mockKoreaExchange.yf_exchangeName
      });
    });
  });
});