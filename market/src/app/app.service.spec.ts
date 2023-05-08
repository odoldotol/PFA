import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { UpdaterService } from 'src/updater/updater.service';
import { DBRepository } from 'src/database/database.repository';

class UpdaterServiceMock {
  async addAssets() {}
}

class DBRepositoryMock {
  async readPriceByTicker() {}
  async isoCodeToTimezone() {}
  async readPriceByISOcode() {}
  async createConfigExchange() {}
}

describe('AppService', () => {
  let service: AppService;
  let updaterService: UpdaterService;
  let dbRepo: DBRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        { provide: UpdaterService, useClass: UpdaterServiceMock },
        { provide: DBRepository, useClass: DBRepositoryMock }
      ],
    }).compile();

    service = module.get<AppService>(AppService);
    updaterService = module.get<UpdaterService>(UpdaterService);
    dbRepo = module.get<DBRepository>(DBRepository);
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
