import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { EnvKey } from "src/common/enum/envKey.emun";
import { ChildApiService } from "./child-api/child-api.service";
import { MarketService } from "./market.service";

describe('MarketService', () => {
    let service: MarketService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MarketService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn(key => key === EnvKey.Yf_CCC_Code && 'XCCC'),
                    }
                },
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