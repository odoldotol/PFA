import { Test, TestingModule } from "@nestjs/testing";
import { ConnectService } from "./connect.service";
import { RedisService } from "./redis.service";
import * as F from '@fxts/core'

describe("RedisService", () => {

    let module: TestingModule;
    let service: RedisService;
    let client: ConnectService["client"];

    beforeAll(async ()  => {
        module = await Test.createTestingModule({
            providers: [ConnectService, RedisService]
        }).compile();
        service = module.get<RedisService>(RedisService);
        client = module.get<ConnectService>(ConnectService).client;
        await module.init();});

    afterAll(async () => {
        await module.close();});

    const TEST_KEY_PREFIX = "pfa:unittest:";
    const makeTestKey = (keyBody: string) => TEST_KEY_PREFIX + keyBody;
    const testKeyValuePairCount = 500;
    let testKeyValueMap: Map<string, string>;

    beforeEach(async () => {
        testKeyValueMap = new Map<string, string>(F.pipe(
            F.range(testKeyValuePairCount),
            F.map((i) => [`key${i}`, `value${i}`])
        ));
        const msetCommand = ["MSET"];
        testKeyValueMap.forEach((value, keyBody) => {
            msetCommand.push(makeTestKey(keyBody), value);
        });
        if (msetCommand.length%2 === 1) await client.sendCommand(msetCommand);
        else throw new Error("MSET Command must have key-value pair.");});

    afterEach(async () => {
        const allTestKeys: string[] = await client.sendCommand([
            "KEYS", TEST_KEY_PREFIX+"*"
        ]);
        await client.sendCommand([
            "DEL", ...allTestKeys
        ]);});


    it("should be defined", () => {
        expect(service).toBeDefined();});
    
    describe('getAllKeys', () => {
        it("모든 키를 배열로 반환.", async () => {
            const allKeys = await service.getAllKeys();
            allKeys.forEach((key) => {
                if (key.slice(0, TEST_KEY_PREFIX.length) === TEST_KEY_PREFIX) testKeyValueMap.delete(RedisService.getKeyBody(key));
            });
            expect(testKeyValueMap.size).toBe(0);
        });
    });

    describe('setCache', () => {
        const setCacheKey = makeTestKey("setCacheKey");
        const setCacheValue = "setCacheValue";
        it("(key, value, ttl) 튜플배열 받아서 set 한다.", async () => {
            await service.setCache([setCacheKey, setCacheValue, 100]);
            expect(await client.sendCommand([
                "GET", setCacheKey
            ])).toBe(setCacheValue);
        });
        it.todo("성공시 value, 실패시 null 반환."); // 실패? null 반환?
        it.todo("ttl(초) 이후에 만료되야 한다.");
        it.todo("number"); // 9999 이하 vs 9999 이상 차이?, 음수, 0, NaN, Infinity, -Infinity
        it.todo("object");
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