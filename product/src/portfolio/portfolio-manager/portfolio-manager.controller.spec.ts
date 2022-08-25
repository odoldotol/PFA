import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioManagerController } from './portfolio-manager.controller';

describe('ManagerController', () => {
  let controller: PortfolioManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PortfolioManagerController],
    }).compile();

    controller = module.get<PortfolioManagerController>(PortfolioManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
