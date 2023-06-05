import { Test, TestingModule } from "@nestjs/testing";
import { ConnectService } from "./connect.service";
import { RedisService } from "./redis.service";

describe("RedisService", () => {

    let module: TestingModule;
    let service: RedisService;

    beforeAll(async ()  => {
        module = await Test.createTestingModule({
            providers: [ConnectService, RedisService]
        }).compile();

        service = module.get<RedisService>(RedisService);

        await module.init();
    });

    beforeAll(async () => {
        await module.close();
    });

    it("should be defined", () => {
        expect(service).toBeDefined();});
    
});