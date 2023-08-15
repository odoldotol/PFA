import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import postgresConfig from 'src/config/postgres.config';
import { TypeOrmConfigService } from '../postgres/typeormConfig.service';
import { Exchange } from './exchange.entity';
import { ExchangeService } from './exchange.service';

describe('ExchangeService', () => {
  let service: ExchangeService;

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
  });

  afterEach(async () => {
    // @ts-ignore
    await service.dataSource.dropDatabase();
  });

  afterAll(async () => {
    // @ts-ignore
    await service.dataSource.destroy();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});