import { Test, TestingModule } from "@nestjs/testing";
import { RedisService } from "./redis.service";
import { Repository } from "./redis.repository";
import { SchemaService } from "./schema.service";
import { joinColon } from "src/common/util";

const TEST_KEY_PREFIX = "test";
const TEST_TTL = 60;
class TestObjEntityClass {
    readonly prop: any;
    readonly updateProp?: any;
    constructor(obj: TestObjEntityClass) {
        this.prop = obj.prop;
        this.updateProp = obj.updateProp;
    }
}
class TestStrEntityClass extends String {}

const setOneReturn = {prop: Math.random()};
const getOneReturn = {prop: Math.random()};
const deleteOneReturn = {prop: Math.random()};
class MockRedisService {
    setOne = jest.fn();
    getOne = jest.fn();
    deleteOne = jest.fn();
}

describe("RedisRepository", () => {

    let module: TestingModule;
    let repository_obj: Repository<TestObjEntityClass>;
    let repository_str: Repository<TestStrEntityClass>;
    let service: RedisService;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            providers: [
                {
                    provide: "TEST_OBJECT_SCHEMA_SERVICE",
                    useValue: {
                        KEY_PREFIX: TEST_KEY_PREFIX,
                        TTL: TEST_TTL,
                        constructorClass: TestObjEntityClass
                    }
                },
                {
                    provide: "TEST_STRING_SCHEMA_SERVICE",
                    useValue: {
                        KEY_PREFIX: TEST_KEY_PREFIX,
                        TTL: TEST_TTL,
                        constructorClass: TestStrEntityClass
                    }
                },
                {
                    provide: "TEST_OBJECT_REPO",
                    useFactory(redisSrv: RedisService, schemaSrv: SchemaService) {
                        return new Repository(redisSrv, schemaSrv);
                    },
                    inject: [RedisService, "TEST_OBJECT_SCHEMA_SERVICE"],
                },
                {
                    provide: "TEST_STRING_REPO",
                    useFactory(redisSrv: RedisService, schemaSrv: SchemaService) {
                        return new Repository(redisSrv, schemaSrv);
                    },
                    inject: [RedisService, "TEST_STRING_SCHEMA_SERVICE"],
                },
                { provide: RedisService, useClass: MockRedisService },
            ],
        }).compile();
        repository_obj = module.get("TEST_OBJECT_REPO");
        repository_str = module.get<Repository<TestStrEntityClass>>("TEST_STRING_REPO");
        service = module.get<RedisService>(RedisService);
    });

    beforeEach(() => {
        jest.spyOn(service, "setOne").mockResolvedValue(setOneReturn);
        jest.spyOn(service, "getOne").mockResolvedValue(getOneReturn);
        jest.spyOn(service, "deleteOne").mockResolvedValue(deleteOneReturn);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("createOne", () => {
        const newValue = new TestObjEntityClass({prop: "newValue"});
        it("service.setOne 실행. 스키마에 따라서 key prefix, ttl 적용, 존재하지 않는 키에 대해서만 수행.", async () => {
            const testReturn = await repository_obj.createOne("newKey", newValue);
            expect(service.setOne).toBeCalledTimes(1);
            expect(service.setOne).toBeCalledWith(
                [joinColon(TEST_KEY_PREFIX, "newKey"), newValue],
                { expireSec: TEST_TTL, ifNotExist: true });
            expect(testReturn!.prop).toBe(setOneReturn.prop);
        });

        it("(임시) 반환하는 value 는 생성 클래스의 인스턴스이어야 함", async () => {
            expect(await repository_obj.createOne("newKey", newValue))
                .toBeInstanceOf(TestObjEntityClass);
        });

        it.todo("실패시 null 반환하지 말고 그에 맞는 에러 던지기");
    });
    
    describe("findOne", () => {
        it("service.getOne 실행.", async () => {
            const testReturn = await repository_obj.findOne("alreadyKey");
            expect(service.getOne).toBeCalledTimes(1);
            expect(service.getOne).toBeCalledWith(joinColon(TEST_KEY_PREFIX, "alreadyKey"));
            expect(testReturn!.prop).toBe(getOneReturn.prop);
        });

        it("(임시) 반환하는 value 는 생성 클래스의 인스턴스이어야 함", async () => {
            expect(await repository_obj.findOne("alreadyKey"))
                .toBeInstanceOf(TestObjEntityClass);
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
                [joinColon(TEST_KEY_PREFIX, "alreadyKey"), updatedValue],
                { expireSec: TEST_TTL, ifExist: true });
        });

        it("(임시) 반환하는 value 는 생성 클래스의 인스턴스이어야 함", async () => {
            expect(await repository_obj.updateOne("alreadyKey", updateValue))
                .toBeInstanceOf(TestObjEntityClass);
        });

        it("String, Number 객체의 인스턴스 같이 RedisService.setOne 에서 불변타입 반환하는 경우", async () => {
            const testReturn = await repository_str.updateOne("alreadyKey", new TestStrEntityClass("updateValue"));
            expect(service.setOne).toBeCalledTimes(1);
            expect(service.setOne).toBeCalledWith(
                [joinColon(TEST_KEY_PREFIX, "alreadyKey"), new TestStrEntityClass("updateValue")],
                { expireSec: TEST_TTL, ifExist: true });
            expect(testReturn).toBeInstanceOf(TestStrEntityClass);
        });

        it.todo("실패시 null 반환하지 말고 그에 맞는 에러 던지기");
    });
    
    describe("deleteOne", () => {
        it("service.deleteOne 실행.", async () => {
            await repository_obj.deleteOne("alreadyKey");
            expect(service.deleteOne).toBeCalledTimes(1);
            expect(service.deleteOne).toBeCalledWith(joinColon(TEST_KEY_PREFIX, "alreadyKey"));
        });

        it("(임시) 반환하는 value 는 생성 클래스의 인스턴스이어야 함", async () => {
            expect(await repository_obj.deleteOne("alreadyKey"))
                .toBeInstanceOf(TestObjEntityClass);
        });
    });

    describe("getAllKeyValueMap", () => {
        it.todo('레포지토리에 해당하는 모든 키-값 쌍을 Map 에 담아서 반환.');
        it.todo('key(Redis keyBody) => value(: T) 매핑');
    });
    
});