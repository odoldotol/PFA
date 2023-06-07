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

    createOne = (key: string, value: T) => this.redisSrv.setOne([this.KEY_PREFIX+key, value], { expireSec: this.TTL, ifNotExist: true });

    findOne = (key: string) => Promise.resolve(null);

    updateOne = (key: string, update: Partial<T>) => Promise.resolve(null);

    deleteOne = (key: string) => Promise.resolve(true);

    get = (key: string) => Promise.resolve(null);

    copy = (v: T | null ) => null;

}