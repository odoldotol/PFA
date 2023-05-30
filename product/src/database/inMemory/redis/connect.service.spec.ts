import { ConnectService } from "./connect.service";

describe('RedisConnectService', () => {

    let service: ConnectService;

    beforeEach(() => {
        service = new ConnectService();
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    it.todo("연결 잘 되나");
    it.todo("연결 에러시 처리 적절히 하나");

    describe("Getter client", () => {
        it("should be defined", () => {
            expect(service.client).toBeDefined();
        });

        it.todo("should return redis client");
    });

});