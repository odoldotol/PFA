import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { ConnectService } from "./connect.service";
import { RedisService } from "./redis.service";
import * as F from '@fxts/core'

// Todo: Refac - 전체적으로 중복제거하기

describe("RedisService", () => {

    let module: TestingModule;
    let service: RedisService;
    let client: ConnectService["client"];

    beforeAll(async ()  => {
        module = await Test.createTestingModule({
            imports: [ConfigModule],
            providers: [ConnectService, RedisService]
        }).compile();
        service = module.get<RedisService>(RedisService);
        client = module.get<ConnectService>(ConnectService).client;
        await module.init();});

    afterAll(async () => {
        await module.close();});

    const TEST_KEY_PREFIX = "pfa:unittest:";
    const makeTestKey = (keyBody: string) => TEST_KEY_PREFIX + keyBody;
    const testKeyValuePairCount = 250;
    let testKeyValueMap: Map<string, string>;

    beforeEach(async () => {
        testKeyValueMap = new Map<string, string>(F.pipe(
            F.range(testKeyValuePairCount),
            F.map((i) => [`key${i}`, `value${i}`])
        ));
        const msetCommand = ["MSET"];
        testKeyValueMap.forEach((value, keyBody) => {
            msetCommand.push(makeTestKey(keyBody), JSON.stringify(value));
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

    describe('setOne - value를 Json형태로 set하고 value를 반환', () => {
        type TestCase = [any, string];
        type TestSetOneTable = TestCase[];
        const testSetOne = async (table: TestSetOneTable) => {
            it.each(
                table.map(ele => ({value: ele[0], desc: ele[1]}))
            )("$desc", async ({value}) => {
                const testKey = makeTestKey("testKey");
                const valueAsJson = JSON.stringify(value);
                expect(await service.setOne([testKey, value]))
                    .toStrictEqual(JSON.parse(valueAsJson));
                expect(await client.sendCommand([
                    "GET", testKey
                ])).toStrictEqual(valueAsJson);
            });
        };

        describe('value type: string', () => {
            testSetOne([
                ["setOneValue", "string"]
            ]);
        });
        describe('value type: number', () => {
            testSetOne([
                [77777, "positive integer"],
                [-777, "negative integer"],
                [0, "zero"],
                [0.123456789, "decimal"],
                [0x624f6c6c6f, "hexadecimal"],
                [2e64, "exponential"]
            ]);
        });
        describe('value type: object', () => {
            testSetOne([
                [{a: 1, b: 2}, "object"],
                [{a: 1, b: ()=>{}}, "function prop"],
                [new Date(), "Date"]
            ]);
        });

        describe("잘못된 타입의 value 는 set 하지 않으며, 단지 null 을 반환함.", () => {
            it.each([
                undefined,
                null,
                NaN,
                Infinity,
                -Infinity,
                ()=>{}
            ])("%p", async (wrongValue) => {
                const testKey = makeTestKey("testKey");
                expect(await service.setOne([testKey, wrongValue]))
                    .toBeNull();
                expect(await client.sendCommand([
                    "EXISTS", testKey
                ])).toBe(0);
            });
        });

        describe("set expire time", () => {
            it("setOptions 에서 만료시간 설정하지 않으면 Expire 안함.", async () => {
                const testKey = makeTestKey("testKey");
                await service.setOne([testKey, "testValue"]);
                expect(await client.sendCommand([
                    "TTL", testKey
                ])).toBe(-1);
            });
            it("setOptions 에서 만료시간 설정.", async () => {
                const testKey = makeTestKey("testKey");
                await service.setOne([testKey, "testValue"], {expireSec: 100});
                expect(await client.sendCommand([
                    "TTL", testKey
                ])).toBe(100);
            });
        });

        describe("set if not exist", () => {
            it("setOptions 에서 키가 존재하지 않을때만 set 하도록 설정 (null 반환)", async () => {
                const testKeyBody = testKeyValueMap.keys().next().value;
                const existTestKey = makeTestKey(testKeyBody);
                expect(await service.setOne([existTestKey, "testValue"], {ifNotExist: true}))
                    .toBe(null);
                expect(JSON.parse(await client.sendCommand([
                    "GET", existTestKey
                ]))).toBe((testKeyValueMap.get(testKeyBody)));
            });
        });
        
        describe("set if exist", () => {
            it("setOptions 에서 키가 존재할때만 set 하도록 설정 (null 반환)", async () => {
                const notExistTestKey = makeTestKey(`key${testKeyValuePairCount}`);
                expect(await service.setOne([notExistTestKey, "testValue"], {ifExist: true}))
                    .toBe(null);
                expect(JSON.parse(await client.sendCommand([
                    "EXISTS", notExistTestKey
                ]))).toBe(0);
            });
        });
    });

    describe('deleteOne', () => {
        it("key 하나 삭제하고 Json 파싱된 value 반환. 삭제할 키가 없을시 null 반환.", async () => {
            const testKeyBody = testKeyValueMap.keys().next().value;
            const testKey = makeTestKey(testKeyBody);
            expect(await client.sendCommand([
                "EXISTS", testKey
            ])).toBe(1);
            expect(await service.deleteOne(testKey))
                .toBe(testKeyValueMap.get(testKeyBody));
            expect(await client.sendCommand([
                "EXISTS", testKey
            ])).toBe(0);
            expect(await service.deleteOne(testKey)).toBe(null);
        });
    });

    describe('getOne', () => {
        it("key 하나 조회하고 Json 파싱된 value 반환. 없으면 null 반환.", async () => {
            const testKeyBody = testKeyValueMap.keys().next().value;
            const testKey = makeTestKey(testKeyBody);
            expect(await service.getOne(testKey))
                .toBe(testKeyValueMap.get(testKeyBody));
            await client.sendCommand([
                "DEL", testKey
            ]);
            expect(await service.getOne(testKey)).toBe(null);
        });
    });
    
});