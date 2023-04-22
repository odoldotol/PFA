import { Test, TestingModule } from '@nestjs/testing';
import { ProductApiService } from './product-api.service';

describe('ProductApiService', () => {
  let service: ProductApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductApiService],
    }).compile();

    service = module.get<ProductApiService>(ProductApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
