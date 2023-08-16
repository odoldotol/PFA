import { ConfigModule, ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import postgresConfig from "src/config/postgres.config";
import { DataSource } from "typeorm";
import { Exchange } from "../exchange/exchange.entity";
import { TypeOrmConfigService } from "../postgres/typeormConfig.service";
import { FinancialAsset } from "./financialAsset.entity";
import { FinancialAssetService } from "./financialAsset.service";

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
      providers: [FinancialAssetService],
    }).compile();

    service = module.get<FinancialAssetService>(FinancialAssetService);
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(async () => {
    await dataSource.dropDatabase();
    await dataSource.destroy();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });


});