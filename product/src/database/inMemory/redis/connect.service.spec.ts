import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { ConnectionService } from "./connect.service";
import { createClient } from 'redis';

const testClient = createClient({
    socket: { reconnectStrategy: false }
});

it("test 에 이용할 redis 인스턴스가 6379 포트에 준비되어 있어야함.", async () => {
    await testClient.connect();
    expect(testClient.isOpen).toBeTruthy();
    testClient.isOpen && await testClient.disconnect();
});

/**
 * TODO: 왜 Redis 연결을 다 끈어도
 * 
 * A worker process has failed to exit gracefully and has been force exited.
 * This is likely caused by tests leaking due to improper teardown.
 * Try running with --detectOpenHandles to find leaks.
 * Active timers can also cause this, ensure that .unref() was called on them.
 * 
 * 위 경고 메세지가 사라지지 않는지 알아내기.
 * 
 * 맨 위의 테스트 케이스에서 처럼, spec 파일 내에서 연결하고 끊으면 괜찮은데,
 * 테스트모듈에서 연결하고 끊는것은 경고메시지가 뜬다.
 * 
 * => jest 동작 원리 더 이해하기
 */
describe('RedisConnectService', () => {

    let module: TestingModule;
    let service: ConnectionService;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [ConfigModule],
            providers: [ConnectionService],
        }).compile();

        service = module.get(ConnectionService);
        
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