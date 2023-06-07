import { Test, TestingModule } from "@nestjs/testing";
import { RedisService } from "./redis.service";
import { RedisRepository } from "./redis.repository";
import { InMemorySchema } from "../class/schema.class";

const TEST_KEY_PREFIX = "test:";
const TEST_TTL = 60;
class TestEntityConstructorClass {
    readonly prop: any;
    constructor(obj: TestEntityConstructorClass) {
        this.prop = obj.prop;
    }
}
const testSchema = new InMemorySchema(TEST_KEY_PREFIX, TEST_TTL, TestEntityConstructorClass);
const mockRedisStore = new Map<string, any>();
const setOneReturn = {prop: Math.random()};
const getOneReturn = {prop: Math.random()};
class MockRedisService {
    setOne = jest.fn();
    getOne = jest.fn();
    deleteOne = jest.fn();
}

describe("RedisRepository", () => {

    let module: TestingModule;
    let repository: InMemoryRepositoryI<TestEntityConstructorClass>;
    let service: RedisService;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            providers: [
                { provide: InMemorySchema, useValue: testSchema },
                {
                    provide: RedisRepository,
                    useFactory(redisSrv: RedisService, schema: InMemorySchema) {
                        return new RedisRepository(redisSrv, schema);
                    },
                    inject: [RedisService, InMemorySchema],
                },
                { provide: RedisService, useClass: MockRedisService },
            ],
        }).compile();
        repository = module.get<RedisRepository<TestEntityConstructorClass>>(RedisRepository);
        service = module.get<RedisService>(RedisService);
    });

    beforeEach(() => {
        mockRedisStore.set(TEST_KEY_PREFIX+"alreadyKey", "alreadyValue");
        jest.spyOn(service, "setOne").mockResolvedValue(setOneReturn);
        jest.spyOn(service, "getOne").mockResolvedValue(getOneReturn);
    });

    afterEach(() => {
        mockRedisStore.clear();
        jest.clearAllMocks();
    });

    describe("createOne", () => {
        const newValue = new TestEntityConstructorClass({prop: "newValue"});
        it("service.setOne 실행. 스키마에 따라서 key prefix, ttl 적용, 존재하지 않는 키에 대해서만 수행.", async () => {
            const testReturn = await repository.createOne("newKey", newValue);
            expect(service.setOne).toBeCalledTimes(1);
            expect(service.setOne).toBeCalledWith([TEST_KEY_PREFIX+"newKey", newValue], { expireSec: TEST_TTL, ifNotExist: true });
            expect(testReturn!.prop).toBe(setOneReturn.prop);
        });

        it("(임시) 반환하는 value 는 생성 클래스의 인스턴스이어야 함", async () => {
            expect(await repository.createOne("newKey", newValue))
                .toBeInstanceOf(TestEntityConstructorClass);
        });

        it.todo("실패시 null 반환하지 말고 그에 맞는 에러 던지기");
    });
    
    describe("findOne", () => {
        it("service.getOne 실행을 반환.", async () => {
            expect(await repository.findOne("alreadyKey"))
                .toBe(getOneReturn);
            expect(service.getOne).toBeCalledWith(TEST_KEY_PREFIX+"alreadyKey");
            expect(service.getOne).toBeCalledTimes(1);
        });
    });
    
    describe("updateOne", () => {
        it("service.setOne 실행을 반환. 스키마에 따라서 key prefix, ttl 적용, 존재하는 키에 대해서만 수행.", async () => {
            // expect(await repository.updateOne("alreadyKey", "newValue"))
            //     .toBe(setOneReturn);
            expect(service.setOne).toBeCalledWith([TEST_KEY_PREFIX+"alreadyKey", "newValue"], { expireSec: TEST_TTL, ifExist: true });
            expect(service.setOne).toBeCalledTimes(1);
        });
        it.todo("실패시 null 반환하지 말고 그에 맞는 에러 던지기");
    });
    
    describe("deleteOne", () => {
        it.todo("service.deleteOne 이용")
        it.todo("하나 삭제하고 value 반환. 삭제할 키가 없을시 null 반환");
    });
    
    // 사용하지 않을 예정
    describe("get", () => {});
    
    // 사용하지 않을 예정
    describe("copy", () => {
        it("스키마의 객체 생성 클래스의 인스턴스를 새로 만들어서 반환. null 이면 null 반환.", () => {
            const testObj = new TestEntityConstructorClass({prop: "testValue"});
            const copyObj = repository.copy(testObj)
            expect(copyObj).toBeInstanceOf(TestEntityConstructorClass);
            expect(testObj === copyObj).toBeFalsy();
            expect(testObj.prop === copyObj!.prop).toBeTruthy();
            expect(repository.copy(null)).toBe(null);
        });
    });

    
});