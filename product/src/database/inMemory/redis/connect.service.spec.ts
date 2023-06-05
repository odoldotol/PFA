import { Test } from "@nestjs/testing";
import { ConnectService } from "./connect.service";

describe('RedisConnectService', () => {

    let service: ConnectService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [ConnectService],
        }).compile();

        service = module.get<ConnectService>(ConnectService);
        await service.onModuleInit();
    });

    afterEach(async () => {
        await service.client.disconnect();
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    it.todo("모듈이 생성될때 연결 잘 하나");
    it.todo("연결 에러시 처리 적절히 하나");

    describe("Getter client", () => {

        it("should be defined", () => {
            expect(service.client).toBeDefined();
        });

        it("should return redis client in ready.", () => {
            expect(service.client.isReady).toBeTruthy();
        });
    });

    it.todo("연결에 문제가 생김에 따른 대처");

});