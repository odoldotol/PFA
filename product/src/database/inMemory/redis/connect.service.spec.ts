import { Test, TestingModule } from "@nestjs/testing";
import { ConnectService } from "./connect.service";
import { createClient } from 'redis';

const testClient = createClient({
    socket: { reconnectStrategy: false }
});

it("test 에 이용할 redis 인스턴스가 6379 포트에 준비되어 있어야함.", async () => {
    await testClient.connect();
    expect(testClient.isOpen).toBeTruthy();
});

if (!testClient.isOpen) throw new Error("test 에 이용할 redis 인스턴스가 로컬:6379 에 준비되어 있어야함.");

describe('RedisConnectService', () => {

    let module: TestingModule;
    let service: ConnectService;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            providers: [ConnectService],
        }).compile();

        service = module.get<ConnectService>(ConnectService);
        
        await module.init();
    });

    afterEach(async () => {
        await module.close();
    });

    it("should be defined", () => {
        expect(service).toBeDefined();});


    it.todo("모듈이 생성될때 연결 잘 하나");
    it.todo("연결 에러시 처리 적절히 하나");
    

    describe("앱이 종료될떄 연결을 끊자.", () => {
        describe("onApplicationShutdown 매서드 이용", () => {
            it("연결을 끊는다", async () => {
                await service.onApplicationShutdown();
                expect(service.client.isReady).toBeFalsy();
                expect(service.client.isOpen).toBeFalsy();});

            it("멱등성 보장 - 이미 연결이 닫혀있어도 실행에 문제가 없고 결과가 같아야함.", async () => {
                await service.onApplicationShutdown();
                await service.onApplicationShutdown();
                expect(service.client.isReady).toBeFalsy();
                expect(service.client.isOpen).toBeFalsy();});});});

    describe("Getter client", () => {
        it("should be defined", () => {
            expect(service.client).toBeDefined();});

        it("should return redis client in ready.", () => {
            expect(service.client.isReady).toBeTruthy();});});


    it.todo("앱 구동중에 연결에 문제가 생김에 따른 대처");

});