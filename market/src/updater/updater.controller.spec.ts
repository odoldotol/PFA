import { Test, TestingModule } from '@nestjs/testing';
import { UpdaterController } from './updater.controller';

describe('UpdaterController', () => {
  let controller: UpdaterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UpdaterController],
    }).compile();

    controller = module.get<UpdaterController>(UpdaterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
