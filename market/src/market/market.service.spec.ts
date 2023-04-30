import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { Either } from "src/common/class/either";
import { ChildApiService } from "./child-api/child-api.service";
import { MarketService } from "./market.service";

describe('MarketService', () => {

    let marketService: MarketService;
    let childApiService: ChildApiService;
    let configService: ConfigService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MarketService,
                {
                    provide: ChildApiService,
                    useValue: {
                        fetchYfInfo: jest.fn(),
                        fetchYfPrice: jest.fn(),
                        fetchEcSession: jest.fn()
                    }
                }
            ],
        }).compile();

        marketService = module.get<MarketService>(MarketService);
        childApiService = module.get<ChildApiService>(ChildApiService);
        configService = module.get<ConfigService>(ConfigService);
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