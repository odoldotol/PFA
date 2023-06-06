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

    describe('setAsJson - value를 Json형태로 set하고 value를 반환. 만료시간을 지정한다.', () => {

        const testSetAsJson = async (value: any, valueDesc: string) => {
            const testKey = makeTestKey("testKey");
            const testTtl = 100;
            const valueAsJson = JSON.stringify(value);
    
            it(`${valueDesc}`, async () => {
                expect(await service.setAsJson([testKey, value, testTtl])).toBe(value);
                expect(await client.sendCommand([
                    "GET", testKey
                ])).toBe(valueAsJson);
                expect(await client.sendCommand([
                    "TTL", testKey
                ])).toBeLessThanOrEqual(testTtl);
                await client.sendCommand([
                    "DEL", testKey
                ]);
            });
        };

        describe('value type: string', () => {
            testSetAsJson("setCacheValue", "string");
        });
        describe('value type: number', () => {
            testSetAsJson(77777, "positive integer");
            testSetAsJson(-777, "negative integer");
            testSetAsJson(0, "zero");
            testSetAsJson(0.123456789, "decimal");
            testSetAsJson(0x624f6c6c6f, "hexadecimal");
            testSetAsJson(2e64, "exponential");
            // 아래 3개는 실패하는게 좋을것같은데? 이런걸 왜 저장해야하나?.
            testSetAsJson(NaN, "NaN");
            testSetAsJson(Infinity, "Infinity");
            testSetAsJson(-Infinity, "-Infinity");
        });

        it.todo("object");
        it.todo("잘못된 타입의 value | set 실패시 null 반환.");
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