import { Injectable } from "@nestjs/common";
import { InMemorySchema } from "../class/schema.class";
import { RedisService } from "./redis.service";
import * as F from "@fxts/core";

@Injectable()
export class RedisRepository<T> implements InMemoryRepositoryI<T> {

    private readonly KEY_PREFIX = this.schema.keyPrefix;
    private readonly TTL = this.schema.ttl;

    constructor(
        private readonly redisSrv: RedisService,
        private readonly schema: InMemorySchema,
    ) {}

    createOne = (key: string, value: T) => F.pipe(
        this.redisSrv.setOne([this.makeKey(key), value], { expireSec: this.TTL, ifNotExist: true }),
        this.valueFactory);

    findOne = (key: string) => F.pipe(
        this.redisSrv.getOne(this.makeKey(key)),
        this.valueFactory);

    updateOne = (key: string, update: Partial<T>) => F.pipe(
        this.findOne(key),
        v => v && Object.assign(v, update),
        v => v && this.redisSrv.setOne([this.makeKey(key), v], { expireSec: this.TTL, ifExist: true }),
        this.valueFactory);

    deleteOne = (key: string) => Promise.resolve(true);

    private valueFactory = (v: T | null ) => v && new this.schema.constructorClass(v) as T;

    // Todo: 키 타입(프리픽스s+키바디), 키 프리픽스 타입(string+";"), 키 바디 타입(':' 있으면 안됨) 만들기
    private makeKey = (keyBody: string) => this.KEY_PREFIX + keyBody;

}