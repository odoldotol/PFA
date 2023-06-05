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

    afterAll(async () => {
        await module.close();
    });

    it("should be defined", () => {
        expect(service).toBeDefined();});
    
    describe('getAllKeys', () => {
        it.todo("모든 키를 배열로 반환.");
    });

    describe('setCache', () => {
        it.todo("key, value, ttl 튜플 받아서 set 한다.");
        it.todo("성공시 value, 실패시 null 반환."); // 실패? null 반환?
        it.todo("ttl(초) 이후에 만료되야 한다.");
    });

    describe('deleteCache', () => {
        it.todo("key 하나를 받아서 삭제한다.");
        it.todo("성공시 true, 실패시 false 반환.");
    });

    describe('getValue', () => {
        it.todo("key 하나를 받아서 value 하나를 반환.");
        it.todo("없으면 null 반환.");
    });
    
});