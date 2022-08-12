import { Test, TestingModule } from '@nestjs/testing';
import { UpdaterController } from './updater.controller';
import { UpdaterService } from './updater.service';

describe('UpdaterController', () => {
  let controller: UpdaterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UpdaterController],
      providers: [UpdaterService],
    }).compile();

    controller = module.get<UpdaterController>(UpdaterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
