import { Test, TestingModule } from "@nestjs/testing";
import { RedisService } from "./redis.service";
import { RedisRepository } from "./redis.repository";
import { InMemorySchema } from "../class/schema.class";

const TEST_KEY_PREFIX = "test:";
const TEST_TTL = 60;
class TestEntityConstructorClass {
    readonly prop: any;
    readonly updateProp?: any;
    constructor(obj: TestEntityConstructorClass) {
        this.prop = obj.prop;
        this.updateProp = obj.updateProp;
    }
}
const testSchema = new InMemorySchema(TEST_KEY_PREFIX, TEST_TTL, TestEntityConstructorClass);
const testStringSchema = new InMemorySchema(TEST_KEY_PREFIX, TEST_TTL, String);
const setOneReturn = {prop: Math.random()};
const getOneReturn = {prop: Math.random()};
class MockRedisService {
    setOne = jest.fn();
    getOne = jest.fn();
    deleteOne = jest.fn();
}

describe("RedisRepository", () => {

    let module: TestingModule;
    let repository_obj: InMemoryRepositoryI<TestEntityConstructorClass>;
    let repository_str: InMemoryRepositoryI<String>;
    let service: RedisService;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            providers: [
                { provide: TestEntityConstructorClass, useValue: testSchema },
                { provide: String, useValue: testStringSchema },
                {
                    provide: "TEST_OBJECT_REPO",
                    useFactory(redisSrv: RedisService, schema: InMemorySchema) {
                        return new RedisRepository(redisSrv, schema);
                    },
                    inject: [RedisService, TestEntityConstructorClass],
                },
                {
                    provide: "TEST_STRING_REPO",
                    useFactory(redisSrv: RedisService, schema: InMemorySchema) {
                        return new RedisRepository(redisSrv, schema);
                    },
                    inject: [RedisService, String],
                },
                { provide: RedisService, useClass: MockRedisService },
            ],
        }).compile();
        repository_obj = module.get<RedisRepository<TestEntityConstructorClass>>("TEST_OBJECT_REPO");
        repository_str = module.get<RedisRepository<String>>("TEST_STRING_REPO");
        service = module.get<RedisService>(RedisService);
    });

    beforeEach(() => {
        jest.spyOn(service, "setOne").mockResolvedValue(setOneReturn);
        jest.spyOn(service, "getOne").mockResolvedValue(getOneReturn);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("createOne", () => {
        const newValue = new TestEntityConstructorClass({prop: "newValue"});
        it("service.setOne 실행. 스키마에 따라서 key prefix, ttl 적용, 존재하지 않는 키에 대해서만 수행.", async () => {
            const testReturn = await repository_obj.createOne("newKey", newValue);
            expect(service.setOne).toBeCalledTimes(1);
            expect(service.setOne).toBeCalledWith(
                [TEST_KEY_PREFIX+"newKey", newValue],
                { expireSec: TEST_TTL, ifNotExist: true });
            expect(testReturn!.prop).toBe(setOneReturn.prop);
        });

        it("(임시) 반환하는 value 는 생성 클래스의 인스턴스이어야 함", async () => {
            expect(await repository_obj.createOne("newKey", newValue))
                .toBeInstanceOf(TestEntityConstructorClass);
        });

        it.todo("실패시 null 반환하지 말고 그에 맞는 에러 던지기");
    });
    
    describe("findOne", () => {
        it("service.getOne 실행.", async () => {
            const testReturn = await repository_obj.findOne("alreadyKey");
            expect(service.getOne).toBeCalledTimes(1);
            expect(service.getOne).toBeCalledWith(TEST_KEY_PREFIX+"alreadyKey");
            expect(testReturn!.prop).toBe(getOneReturn.prop);
        });

        it("(임시) 반환하는 value 는 생성 클래스의 인스턴스이어야 함", async () => {
            expect(await repository_obj.findOne("alreadyKey"))
                .toBeInstanceOf(TestEntityConstructorClass);
        });
    });
    
    describe("updateOne", () => {
        it("findOne And Update.", async () => {
            jest.spyOn(repository_obj, "findOne");
            await repository_obj.updateOne("alreadyKey", {updateProp: "updateValue"});
            expect(repository_obj.findOne).toBeCalledTimes(1);
            expect(repository_obj.findOne).toBeCalledWith("alreadyKey");
        });

        const updateValue = {updateProp: "updateValue"};
        const updatedValue = Object.assign(getOneReturn, updateValue);

        it("업데이트된 value 로 service.setOne 실행. 스키마에 따라서 key prefix, ttl 적용, 존재하는 키에 대해서만 수행.", async () => {
            await repository_obj.updateOne("alreadyKey", updateValue);
            expect(service.setOne).toBeCalledTimes(1);
            expect(service.setOne).toBeCalledWith(
                [TEST_KEY_PREFIX+"alreadyKey", updatedValue],
                { expireSec: TEST_TTL, ifExist: true });
        });

        it("(임시) 반환하는 value 는 생성 클래스의 인스턴스이어야 함", async () => {
            expect(await repository_obj.updateOne("alreadyKey", updateValue))
                .toBeInstanceOf(TestEntityConstructorClass);
        });

        it("String, Number 객체의 인스턴스 같이 RedisService.setOne 에서 불변타입 반환하는 경우", async () => {
            const testReturn = await repository_str.updateOne("alreadyKey", "updateValue");
            expect(testReturn).toBe("updateValue");
        })
        
        it.todo("실패시 null 반환하지 말고 그에 맞는 에러 던지기");
    });
    
    describe("deleteOne", () => {
        it.todo("service.deleteOne 이용")
        it.todo("하나 삭제하고 value 반환. 삭제할 키가 없을시 null 반환");
    });
    
});