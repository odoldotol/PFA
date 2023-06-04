import { Injectable } from "@nestjs/common";
import { RedisService } from "./redis.service";

@Injectable()
export class RedisRepository<T> implements InMemoryRepositoryI<T> {

    constructor(
        private readonly redisSrv: RedisService,
        private readonly schema: InMemorySchemaI,
    ) {}

    createOne = (key: string, value: T) => Promise.resolve(null);

    findOne = (key: string) => Promise.resolve(null);

    updateOne = (key: string, update: Partial<T>) => Promise.resolve(null);

    deleteOne = (key: string) => Promise.resolve(true);

    get = (key: string) => Promise.resolve(null);

    copy = (v: T | null ) => null;

}