import { Test, TestingModule } from "@nestjs/testing";
import { RedisService } from "./redis.service";
import { RedisRepository } from "./redis.repository";
import { InMemorySchema } from "../class/schema.class";

const TEST_KEY_PREFIX = "test:";
const TEST_TTL = 60;
class TestSchema {}
const testSchema = new InMemorySchema(TEST_KEY_PREFIX, TEST_TTL, TestSchema);
const mockRedisStore = new Map<string, any>();
class MockRedisService {
    setOne = jest.fn();
    getOne = jest.fn();
    deleteOne = jest.fn();
}

describe("RedisRepository", () => {

    let module: TestingModule;
    let repository: InMemoryRepositoryI<any>;
    let service: RedisService;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            providers: [
                { provide: TestSchema, useValue: testSchema },
                {
                    provide: RedisRepository,
                    useFactory(redisSrv: RedisService, schema: InMemorySchema) {
                        return new RedisRepository(redisSrv, schema);
                    },
                    inject: [RedisService, TestSchema],
                },
                { provide: RedisService, useClass: MockRedisService },
            ],
        }).compile();
        repository = module.get<RedisRepository<any>>(RedisRepository);
        service = module.get<RedisService>(RedisService);
    });

    beforeEach(() => {
        mockRedisStore.set(TEST_KEY_PREFIX+"alreadyKey", "alreadyValue");
    });

    afterEach(() => {
        mockRedisStore.clear();
    });

    describe("createOne", () => {
        it("service.setOne 이용. 스키마에 따라서 key prefix, ttl 적용, 존재하지 않는 키에 대해서만 수행.", async () => {
            await repository.createOne("newKey", "newValue");
            expect(service.setOne).toBeCalledWith([TEST_KEY_PREFIX+"newKey", "newValue"], { expireSec: TEST_TTL, ifNotExist: true });
        })
        it.todo("실패시 null 반환하지 말고 그에 맞는 에러 던지기");
    });
    
    describe("findOne", () => {
        it.todo("service.getOne 이용")
        it.todo("하나 조회. 있으면 value, 없으면 null 반환");
    });
    
    describe("updateOne", () => {
        it.todo("service.setOne 이용")
        it.todo("하나 업데이트. 존재하는 키에 대해서만 수행. 성공시 value, 실패시 null 반환");
        it.todo("실패시 그에 맞는 에러 던지기");
    });
    
    describe("deleteOne", () => {
        it.todo("service.deleteOne 이용")
        it.todo("하나 삭제하고 value 반환. 삭제할 키가 없을시 null 반환");
    });
    
    // 사용하지 않을 예정
    describe("get", () => {});
    
    // 사용하지 않을 예장
    describe("copy", () => {});

    
});