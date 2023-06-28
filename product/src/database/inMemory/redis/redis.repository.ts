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

    createOne = (keyBody: string, value: T) => F.pipe(
        this.redisSrv.setOne([this.makeKey(keyBody), value], { expireSec: this.TTL, ifNotExist: true }),
        this.valueFactory);

    findOne = (keyBody: string) => F.pipe(
        this.redisSrv.getOne(this.makeKey(keyBody)),
        this.valueFactory);

    // Todo: 함수 추출하기, 조건문 없에기
    updateOne = (keyBody: string, update: Partial<T>) => F.pipe(
        this.findOne(keyBody),
        (v: T|null) => {
            if (v instanceof Object) {
                if (typeof v.valueOf() === "object") return Object.assign(v, update);
                else return update as T;
            } else return null;
        },
        v => v && this.redisSrv.setOne([this.makeKey(keyBody), v], { expireSec: this.TTL, ifExist: true }),
        this.valueFactory);

    deleteOne = (keyBody: string) => F.pipe(
        this.redisSrv.deleteOne(this.makeKey(keyBody)),
        this.valueFactory);

    /**
     * @todo 트렌젝션으로 scan 과 mget 쓰는게 안전하고 효율적이겠지?
     * - key: keyBody
     */
    public async getAllKeyValueMap() {
        return new Map(await F.pipe(
            this.redisSrv.getAllKeys(this.KEY_PREFIX),
            F.map(RedisService.getKeyBody), F.toAsync,
            F.map(this.getKeyValueSet.bind(this)), F.toArray
        ));
    }

    private async getKeyValueSet(keyBody: string) {
        return [ keyBody, await this.findOne(keyBody) ] as [string, T|null];
    }

    private valueFactory = (v: T | null ) => v && new this.schema.constructorClass(v) as T;

    // Todo: 키 타입(프리픽스s+키바디), 키 프리픽스 타입(string+";"), 키 바디 타입(':' 있으면 안됨) 만들기
    private makeKey = (keyBody: string) => this.KEY_PREFIX + keyBody;

}