import { Test, TestingModule } from "@nestjs/testing";
import { ChildApiService } from "./child-api/child-api.service";
import { MarketService } from "./market.service";

describe('MarketService', () => {
    let service: MarketService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MarketService,
                {
                    provide: ChildApiService,
                    useValue: {
                        fetchYfInfo: jest.fn(),
                        fetchYfPrice: jest.fn(),
                        fetchEcSession: jest.fn(),
                    }
                }
            ],
        }).compile();

        service = module.get(MarketService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('fetchInfo', () => {
        it.todo('fetchInfo')
    });

    describe('fetchPrice', () => {
        it.todo('fetchPrice');
    });

    describe('fetchExchangeSession', () => {
        it.todo('fetchExchangeSession');
    });
});