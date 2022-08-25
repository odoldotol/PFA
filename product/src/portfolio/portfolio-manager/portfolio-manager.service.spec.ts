import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioManagerService } from './portfolio-manager.service';

describe('ManagerService', () => {
  let service: PortfolioManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PortfolioManagerService],
    }).compile();

    service = module.get<PortfolioManagerService>(PortfolioManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
