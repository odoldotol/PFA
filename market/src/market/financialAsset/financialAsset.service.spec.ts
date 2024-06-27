import { Test, TestingModule } from "@nestjs/testing";
import { ChildApiConfigService } from "src/config";
import { Market_FinancialAssetService } from "./financialAsset.service";
import {
    ConnectionService,
    YfinanceApiService
} from "../childApi";
import { Market_ExchangeService } from "../exchange/exchange.service";

describe('Market_FinancialAssetService', () => {
    let service: Market_FinancialAssetService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                { provide: ConnectionService, useValue: {} },
                { provide: ChildApiConfigService, useValue: {} },
                { provide: YfinanceApiService, useValue: {} },
                { provide: Market_ExchangeService, useValue: {} },
                Market_FinancialAssetService
            ],
        }).compile();

        service = module.get(Market_FinancialAssetService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});