import { Test, TestingModule } from '@nestjs/testing';
import { ChildApiService } from './child-api.service';

describe('ChildApiService', () => {
  let service: ChildApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChildApiService],
    }).compile();

    service = module.get<ChildApiService>(ChildApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
