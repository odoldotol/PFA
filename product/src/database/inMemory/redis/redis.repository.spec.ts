import { Test, TestingModule } from "@nestjs/testing";
import { RedisService } from "./redis.service";
import { RedisRepository } from "./redis.repository";

class TestSchema {}

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
                { provide: TestSchema, useValue: TestSchema },
                {
                    provide: RedisRepository,
                    useFactory(redisSrv: RedisService, schema: InMemorySchemaI) {
                        return new RedisRepository(redisSrv, schema);
                    }
                },
                { provide: RedisService, useClass: MockRedisService },
            ],
        }).compile();
        repository = module.get<RedisRepository<any>>(RedisRepository);
        service = module.get<RedisService>(RedisService);
    });

    describe("createOne", () => {
        it.todo("하나 생성. 존재하지 않는 키에 대해서만 수행. 성공시 value, 실패시 null 반환");
        it.todo("실패시 그에 맞는 에러 던지기");
    });
    
    describe("findOne", () => {
        it.todo("하나 조회. 있으면 value, 없으면 null 반환");
    });
    
    describe("updateOne", () => {
        it.todo("하나 업데이트. 존재하는 키에 대해서만 수행. 성공시 value, 실패시 null 반환");
        it.todo("실패시 그에 맞는 에러 던지기");
    });
    
    describe("deleteOne", () => {
        it.todo("하나 삭제하고 value 반환. 삭제할 키가 없을시 null 반환");
    });
    
    // 사용하지 않을 예정
    describe("get", () => {});
    
    // 사용하지 않을 예장
    describe("copy", () => {});

    
});