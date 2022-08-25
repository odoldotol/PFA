import { Test, TestingModule } from '@nestjs/testing';
import { AaaManagerController } from './aaa-manager.controller';

describe('AaaManagerController', () => {
  let controller: AaaManagerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AaaManagerController],
    }).compile();

    controller = module.get<AaaManagerController>(AaaManagerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
