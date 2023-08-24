import { Test, TestingModule } from "@nestjs/testing";
import { ChildApiService } from "../child_api/child_api.service";
import { AssetService } from "./asset.service";

class MockChildApiService {}

describe('MarketService', () => {
    let service: AssetService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
              { provide: ChildApiService, useClass: MockChildApiService },
              AssetService
            ],
        }).compile();

        service = module.get(AssetService);
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
});