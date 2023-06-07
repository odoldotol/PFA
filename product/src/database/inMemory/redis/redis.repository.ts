import { Injectable } from "@nestjs/common";
import { InMemorySchema } from "../class/schema.class";
import { RedisService } from "./redis.service";

@Injectable()
export class RedisRepository<T> implements InMemoryRepositoryI<T> {

    private readonly KEY_PREFIX = this.schema.keyPrefix;
    private readonly TTL = this.schema.ttl;

    constructor(
        private readonly redisSrv: RedisService,
        private readonly schema: InMemorySchema,
    ) {}

    createOne = (key: string, value: T) => this.redisSrv.setOne([this.makeKey(key), value], { expireSec: this.TTL, ifNotExist: true });

    findOne = (key: string) => this.redisSrv.getOne(this.makeKey(key));

    updateOne = (key: string, update: Partial<T>) => Promise.resolve(null);

    deleteOne = (key: string) => Promise.resolve(true);

    get = (key: string) => Promise.resolve(null);

    copy = (v: T | null ) => null;

    // Todo: 키 타입(프리픽스s+키바디), 키 프리픽스 타입(string+";"), 키 바디 타입(':' 있으면 안됨) 만들기
    private makeKey = (keyBody: string) => this.KEY_PREFIX + keyBody;

}