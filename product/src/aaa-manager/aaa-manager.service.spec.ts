import { Test, TestingModule } from '@nestjs/testing';
import { AaaManagerService } from './aaa-manager.service';

describe('AaaManagerService', () => {
  let service: AaaManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AaaManagerService],
    }).compile();

    service = module.get<AaaManagerService>(AaaManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
