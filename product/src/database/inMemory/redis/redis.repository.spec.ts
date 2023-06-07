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
        jest.spyOn(service, "setOne").mockResolvedValue(setOneReturn);
        jest.spyOn(service, "getOne").mockResolvedValue(getOneReturn);
    });

    afterEach(() => {
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
        it("service.getOne 실행.", async () => {
            const testReturn = await repository.findOne("alreadyKey");
            expect(service.getOne).toBeCalledTimes(1);
            expect(service.getOne).toBeCalledWith(TEST_KEY_PREFIX+"alreadyKey");
            expect(testReturn!.prop).toBe(getOneReturn.prop);
        });

        it("(임시) 반환하는 value 는 생성 클래스의 인스턴스이어야 함", async () => {
            expect(await repository.findOne("alreadyKey"))
                .toBeInstanceOf(TestEntityConstructorClass);
        });
    });
    
    describe("updateOne", () => {
        it("service.setOne 실행. 스키마에 따라서 key prefix, ttl 적용, 존재하는 키에 대해서만 수행.", async () => {
            const testReturn = await repository.updateOne("alreadyKey", {prop: "newValue"});
            // expect(await repository.updateOne("alreadyKey", "newValue"))
            //     .toBe(setOneReturn);
            expect(service.setOne).toBeCalledWith([TEST_KEY_PREFIX+"alreadyKey", "newValue"], { expireSec: TEST_TTL, ifExist: true });
            expect(service.setOne).toBeCalledTimes(1);
        });
        it.todo("String, Number 객체의 인스턴스 같이 RedisService.setOne 에서 불변타입 반환하는 경우")
        it.todo("실패시 null 반환하지 말고 그에 맞는 에러 던지기");
    });
    
    describe("deleteOne", () => {
        it.todo("service.deleteOne 이용")
        it.todo("하나 삭제하고 value 반환. 삭제할 키가 없을시 null 반환");
    });
    
});