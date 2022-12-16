import { Test, TestingModule } from '@nestjs/testing';
import { YahoofinanceService } from './yahoofinance.service';

describe('YahoofinanceService', () => {
  let service: YahoofinanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [YahoofinanceService],
    }).compile();

    service = module.get<YahoofinanceService>(YahoofinanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
