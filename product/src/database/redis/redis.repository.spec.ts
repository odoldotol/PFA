import { COUNT } from "./const";
import { RedisRepository } from "./redis.repository";
import { RedisService } from "./redis.service";
import { SchemaService } from "./schema.service";

// 너무 redisSrv 에 의존하는 걸까?
describe('RedisRepository', () => {
  let repository: RedisRepository<any>;

  beforeAll(async () => {
    repository = new RedisRepository(redisServiceMock, schemaServiceMock);
  });

  beforeEach(() => {
    jest.spyOn(redisServiceMock, "setOne").mockResolvedValue(redisServiceMockResolvedValue.setOne);
    jest.spyOn(redisServiceMock, "getAndDeleteOne").mockResolvedValue(redisServiceMockResolvedValue.getAndDeleteOne);
    jest.spyOn(redisServiceMock, "delete").mockResolvedValue(redisServiceMockResolvedValue.delete);
    jest.spyOn(redisServiceMock, "getOne").mockResolvedValue(redisServiceMockResolvedValue.getOne);
    jest.spyOn(redisServiceMock, "count").mockResolvedValue(redisServiceMockResolvedValue.count);
    redisCacheFactoryMock.mockImplementation((
      keyBody,
      value
    ) => {
      return new RedisCacheMock(keyBody, value);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOne', () => {
    it('should return RedisCache, using redisService.setOne', async () => {
      const result = await repository.createOne(TEST_KEYBODY, TEST_VALUE);
      expect(result).toBeInstanceOf(RedisCacheMock);
      expect(result).toHaveProperty("keyBody", TEST_KEYBODY);
      expect(result).toHaveProperty("value", redisServiceMockResolvedValue.setOne);

      expect(redisServiceMock.setOne).toBeCalledWith(
        TEST_KEY,
        TEST_VALUE,
        { expireSec: schemaServiceMock.TTL, ifNotExist: true }
      );
      expect(redisServiceMock.setOne).toBeCalledTimes(1);

      expect(redisCacheFactoryMock).toBeCalledWith(TEST_KEYBODY, redisServiceMockResolvedValue.setOne);
      expect(redisCacheFactoryMock).toBeCalledTimes(1);
    });
  });

  describe('updateOrCreateOne', () => {
    it('should return RedisCache, using redisService.setOne', async () => {
      const result = await repository.updateOrCreateOne(TEST_KEYBODY, TEST_VALUE);
      expect(result).toBeInstanceOf(RedisCacheMock);
      expect(result).toHaveProperty("keyBody", TEST_KEYBODY);
      expect(result).toHaveProperty("value", redisServiceMockResolvedValue.setOne);

      expect(redisServiceMock.setOne).toBeCalledWith(
        TEST_KEY,
        TEST_VALUE,
        { expireSec: schemaServiceMock.TTL }
      );
      expect(redisServiceMock.setOne).toBeCalledTimes(1);

      expect(redisCacheFactoryMock).toBeCalledWith(TEST_KEYBODY, redisServiceMockResolvedValue.setOne);
      expect(redisCacheFactoryMock).toBeCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return RedisCache, using redisService.getOne', async () => {
      const redult = await repository.findOne(TEST_KEYBODY);
      expect(redult).toBeInstanceOf(RedisCacheMock);
      expect(redult).toHaveProperty("keyBody", TEST_KEYBODY);
      expect(redult).toHaveProperty("value", redisServiceMockResolvedValue.getOne);

      expect(redisServiceMock.getOne).toBeCalledWith(TEST_KEY);
      expect(redisServiceMock.getOne).toBeCalledTimes(1);

      expect(redisCacheFactoryMock).toBeCalledWith(TEST_KEYBODY, redisServiceMockResolvedValue.getOne);
      expect(redisCacheFactoryMock).toBeCalledTimes(1);
    });

    it('should return null if redisService.getOne returns null', async () => {
      jest.spyOn(redisServiceMock, "getOne").mockResolvedValue(null);
      expect(await repository.findOne(TEST_KEYBODY)).toBeNull();
    });
  });

  describe('findOneAndUpdate', () => {
    describe('should return RedisCache with updated value, using redisService.getOne, setOne.', () => {
      it('primitive', async () => {
        const result = await repository.findOneAndUpdate(TEST_KEYBODY, TEST_VALUE);
        expect(result).toBeInstanceOf(RedisCacheMock);
        expect(result).toHaveProperty("keyBody", TEST_KEYBODY);
        expect(result).toHaveProperty("value", redisServiceMockResolvedValue.setOne);
  
        expect(redisServiceMock.getOne).toBeCalledWith(TEST_KEY);
        expect(redisServiceMock.getOne).toBeCalledTimes(1);
  
        expect(redisServiceMock.setOne).toBeCalledWith(
          TEST_KEY,
          TEST_VALUE,
          { expireSec: schemaServiceMock.TTL, ifExist: true }
        );
        expect(redisServiceMock.setOne).toBeCalledTimes(1);
  
        expect(redisCacheFactoryMock).toBeCalledWith(TEST_KEYBODY, redisServiceMockResolvedValue.setOne);
        expect(redisCacheFactoryMock).toBeCalledTimes(1);
      });

      it('object', async () => {
        const CURRENT = {
          prop: TEST_VALUE,
          updateProp: TEST_VALUE
        };
        const UPDATE = {
          updateProp: redisServiceMockResolvedValue.setOne
        };
        const UPDATED = {
          prop: TEST_VALUE,
          updateProp: redisServiceMockResolvedValue.setOne
        };
        jest.spyOn(redisServiceMock, "getOne").mockResolvedValue(CURRENT);
        jest.spyOn(redisServiceMock, "setOne").mockResolvedValue(UPDATED);

        const result = await repository.findOneAndUpdate(TEST_KEYBODY, UPDATE);
        expect(result).toBeInstanceOf(RedisCacheMock);
        expect(result).toHaveProperty("keyBody", TEST_KEYBODY);
        expect(result).toHaveProperty("value", UPDATED);

        expect(redisServiceMock.getOne).toBeCalledWith(TEST_KEY);
        expect(redisServiceMock.getOne).toBeCalledTimes(1);

        expect(redisServiceMock.setOne).toBeCalledWith(
          TEST_KEY,
          UPDATED,
          { expireSec: schemaServiceMock.TTL, ifExist: true }
        );
        expect(redisServiceMock.setOne).toBeCalledTimes(1);

        expect(redisCacheFactoryMock).toBeCalledWith(TEST_KEYBODY, UPDATED);
        expect(redisCacheFactoryMock).toBeCalledTimes(1);
      });
    });

    it('should throw an error if redisService.getOne returns null', async () => {
      jest.spyOn(redisServiceMock, "getOne").mockResolvedValue(null);
      await expect(repository.findOneAndUpdate(TEST_KEYBODY, TEST_VALUE)).rejects.toThrowError();
    });
  });

  describe('deleteOne', () => {
    it('should return true if redisService.delete returns 1 or false', async () => {
      jest.spyOn(redisServiceMock, "delete").mockResolvedValue(1);
      expect(await repository.deleteOne(TEST_KEYBODY)).toBe(true);
      expect(redisServiceMock.delete).toBeCalledWith(TEST_KEY);
      expect(redisServiceMock.delete).toBeCalledTimes(1);

      jest.spyOn(redisServiceMock, "delete").mockResolvedValue(0);
      expect(await repository.deleteOne(TEST_KEYBODY)).toBe(false);
      expect(redisServiceMock.delete).toBeCalledTimes(2);
    });
  });

  describe('getAndDeleteOne', () => {});

  describe('count', () => {
    it('should return count using redis.count', async () => {
      const result = await repository.count(TEST_KEYBODY);
      expect(result).toBe(redisServiceMockResolvedValue.count);

      expect(redisServiceMock.count).toBeCalledWith(TEST_COUNT_KEY);
      expect(redisServiceMock.count).toBeCalledTimes(1);
    });
  });

  describe('getCount', () => {
    it('should return count using redis.getOne', async () => {
      const result = await repository.getCount(TEST_KEYBODY);
      expect(result).toBe(redisServiceMockResolvedValue.getOne);

      expect(redisServiceMock.getOne).toBeCalledWith(TEST_COUNT_KEY);
      expect(redisServiceMock.getOne).toBeCalledTimes(1);
    });

    it('should return 0 if redis.getOne returns null', async () => {
      jest.spyOn(redisServiceMock, "getOne").mockResolvedValue(null);
      expect(await repository.getCount(TEST_KEYBODY)).toBe(0);
    });
  });

  describe('resetCount', () => {
    it('should return true calling this.deleteOne', async () => {
      const DELETE_ONE = "repository.deleteOne" as any;
      jest.spyOn(repository, "deleteOne").mockResolvedValue(true).mockResolvedValue(DELETE_ONE);
      expect(await repository.resetCount(TEST_KEYBODY)).toBe(DELETE_ONE);
      expect(repository.deleteOne).toBeCalledWith(`${TEST_KEYBODY}:${COUNT}`);
      expect(repository.deleteOne).toBeCalledTimes(1);
    });
  });
});

const TEST_TTL = 60000;
const TEST_KEY_PREFIX = "test";

const redisServiceMockResolvedValue = {
  setOne: "setOne" as any,
  getAndDeleteOne: "getAndDeleteOne" as any,
  delete: "delete" as any,
  getOne: "getOne" as any,
  count: "count" as any,
};

const redisServiceMock = {
  setOne: jest.fn(),
  getAndDeleteOne: jest.fn(),
  delete: jest.fn(),
  getOne: jest.fn(),
  count: jest.fn(),
} as any as RedisService;

const redisCacheFactoryMock = jest.fn();

class RedisCacheMock {
  constructor(
    public keyBody: string,
    public value: any,
  ) {}
}

const schemaServiceMock = {
  KEY_PREFIX: TEST_KEY_PREFIX,
  TTL: TEST_TTL,
  createRedisCacheFactory: () => redisCacheFactoryMock,
} as any as SchemaService<any>;

const TEST_VALUE = "value" as any;
const TEST_KEYBODY = "keyBody";
const TEST_KEY = `${schemaServiceMock.KEY_PREFIX}:${TEST_KEYBODY}`;
const TEST_COUNT_KEY = `${TEST_KEY}:${COUNT}`;