import { Test, TestingModule } from "@nestjs/testing";
import { MODULE_OPTIONS_TOKEN } from "./redis.module-definition";
import { REDIS_CLIENT_TOKEN } from "./const";
import { ConnectionService } from "./connection.service";
import { RedisService } from "./redis.service";
import * as F from '@fxts/core'

describe("RedisService", () => {

  let module: TestingModule;
  let service: RedisService;
  let client: Awaited<ReturnType<ConnectionService["connect"]>>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: MODULE_OPTIONS_TOKEN,
          useValue: {
            url: "redis://localhost:6379"
          }
        },
        {
          provide: REDIS_CLIENT_TOKEN,
          useFactory: (connectService: ConnectionService) => {
            return connectService.connect();
          },
          inject: [ConnectionService]
        },
        ConnectionService,
        RedisService
      ]
    }).compile();

    service = module.get<RedisService>(RedisService);
    client = module.get(REDIS_CLIENT_TOKEN);

    await module.init();
  });

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

    if (msetCommand.length % 2 === 1) {
      await client.sendCommand(msetCommand);
    } else {
      throw new Error("MSET Command must have key-value pair.");
    }
  });

  afterEach(async () => {
    const allTestKeys: string[] = await client.sendCommand([
      "KEYS", TEST_KEY_PREFIX + "*"
    ]);

    await client.sendCommand([
      "DEL", ...allTestKeys
    ]);
  });


  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it.todo("addModel");

  describe('getAllKeys', () => {
    it("모든 키를 배열로 반환.", async () => {
      const allKeys = await service.getAllKeys();
      allKeys.forEach((key) => {
        if (key.slice(0, TEST_KEY_PREFIX.length) === TEST_KEY_PREFIX) testKeyValueMap.delete(key.slice(TEST_KEY_PREFIX.length));
      });
      expect(testKeyValueMap.size).toBe(0);
    });

    it.todo('prefix 를 인자로 받을경우 prefix 로 시작하는 키만 반환.');
  });

  describe('setOne - value를 Json형태로 set하고 value를 반환', () => {
    type TestCase = [any, string];
    type TestSetOneTable = TestCase[];
    const testSetOne = async (table: TestSetOneTable) => {
      it.each(
        table.map(ele => ({ value: ele[0], desc: ele[1] }))
      )("$desc", async ({ value }) => {
        const testKey = makeTestKey("testKey");
        const valueAsJson = JSON.stringify(value);
        expect(await service.setOne(testKey, value))
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
        [{ a: 1, b: 2 }, "object"],
        [{ a: 1, b: () => { } }, "function prop"],
        [new Date(), "Date"]
      ]);
    });

    describe("잘못된 타입의 value 는 에러던짐.", () => {
      it.each([
        undefined,
        null,
        NaN,
        Infinity,
        -Infinity,
        () => { }
      ])("%p", async (wrongValue) => {
        const testKey = makeTestKey("testKey");
        expect(() => service.setOne(testKey, wrongValue))
          .rejects.toThrow();
        expect(await client.sendCommand([
          "EXISTS", testKey
        ])).toBe(0);
      });
    });

    describe("set expire time", () => {
      it("setOptions 에서 만료시간 설정하지 않으면 Expire 안함.", async () => {
        const testKey = makeTestKey("testKey");
        await service.setOne(testKey, "testValue");
        expect(await client.sendCommand([
          "TTL", testKey
        ])).toBe(-1);
      });

      it("setOptions 에서 만료시간 설정.", async () => {
        const testKey = makeTestKey("testKey");
        await service.setOne(testKey, "testValue", { expireSec: 100 });
        expect(await client.sendCommand([
          "TTL", testKey
        ])).toBe(100);
      });
    });

    describe("set if not exist", () => {
      it("setOptions 에서 키가 존재하지 않을때만 set 하도록 설정, 이미 존재시 에러", async () => {
        const testKeyBody = testKeyValueMap.keys().next().value;
        const existTestKey = makeTestKey(testKeyBody);
        expect(() => service.setOne(existTestKey, "testValue", { ifNotExist: true }))
          .rejects.toThrow();
        expect(JSON.parse(await client.sendCommand([
          "GET", existTestKey
        ]))).toBe((testKeyValueMap.get(testKeyBody)));
      });
    });

    describe("set if exist", () => {
      it("setOptions 에서 키가 존재할때만 set 하도록 설정, 존재않을시 에러", async () => {
        const notExistTestKey = makeTestKey(`key${testKeyValuePairCount}`);
        expect(() => service.setOne(notExistTestKey, "testValue", { ifExist: true }))
          .rejects.toThrow();
        expect(JSON.parse(await client.sendCommand([
          "EXISTS", notExistTestKey
        ]))).toBe(0);
      });
    });
  });

  describe('getAndDeleteOne', () => {
    it("key 하나 삭제하고 Json 파싱된 value 반환. 삭제할 키가 없을시 에러.", async () => {
      const testKeyBody = testKeyValueMap.keys().next().value;
      const testKey = makeTestKey(testKeyBody);
      expect(await client.sendCommand([
        "EXISTS", testKey
      ])).toBe(1);
      expect(await service.getAndDeleteOne(testKey))
        .toBe(testKeyValueMap.get(testKeyBody));
      expect(await client.sendCommand([
        "EXISTS", testKey
      ])).toBe(0);
      expect(() => service.getAndDeleteOne(testKey)).rejects.toThrow();
    });
  });

  describe('delete: keys 전부 삭제하고 삭제된 갯수 반환', () => {
    it("key 1개", async () => {
      // 1개 삭제
      const testKeyBody = testKeyValueMap.keys().next().value;
      const testKey = makeTestKey(testKeyBody);
      expect(await client.sendCommand([
        "EXISTS", testKey
      ])).toBe(1);
      expect(await service.delete(testKey)).toBe(1);
      expect(await client.sendCommand([
        "EXISTS", testKey
      ])).toBe(0);
      expect(await service.delete(testKey)).toBe(0);
    });

    it.todo('key 여러개 삭제 (레디스=단일쓰레드 고려 아직 사용하지는 않음)');
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

  describe('count', () => {
    it("값 1 증가하고 반환. 키가 없어도 생성하고 1 증가하고 반환.", async () => {
      const testKey = makeTestKey("testKey");
      expect(await service.count(testKey)).toBe(1);
      expect(await service.count(testKey)).toBe(2);

      await client.sendCommand([
        "DEL", testKey
      ]);
      expect(await service.count(testKey)).toBe(1);
    });
  });

  afterAll(async () => {
    await client.disconnect();
    await module.close();
  });
});