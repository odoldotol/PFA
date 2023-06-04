import { Injectable } from "@nestjs/common";
import { AppMemoryService } from "./appMemory.service";
import { MarketDate } from "src/common/class/marketDate.class";
import { CachedPrice } from "src/common/class/cachedPrice.class";
import * as F from "@fxts/core";


@Injectable()
export class AppMemoryRepository<T> implements InMemoryRepositoryI<T> {

    private readonly KEY_SUFFIX: string;
    private readonly TTL: number;

    constructor(
        private readonly appMemorySrv: AppMemoryService,
        private readonly schema: InMemorySchemaI,
    ) {
        if (schema.name === MarketDate.name) {
            this.KEY_SUFFIX = "_priceStatus";
            this.TTL = 0;
        } else if (schema.name === CachedPrice.name) {
            this.KEY_SUFFIX = "";
            this.TTL = 60 * 60 * 24 * 5; // 5 days
        } else {
            throw new Error("Invalid schema");
        }
    }

    // Todo: 이미 있는 키 set 막기
    // Todo: null 반환 하지 말고 에러 던져야함
    createOne = (key: string, value: T) => F.pipe(
        this.appMemorySrv.setCache([key + this.KEY_SUFFIX, new this.schema(value), this.TTL]),
        this.copy);

    findOne = (key: string) => F.pipe(
        this.get(key),
        this.copy);
    
    /**
     * ### 주의 - 현재 MarketDate(string 같은 불변타입) 지원 안함. 사용 금지.
     * - Todo: 존재하는 키만 set 허용하기
     * - Todo: marketDate(string 같은 불변타입) 솔루션 적용하기
     */
    updateOne = (key: string, update: Partial<T>) => F.pipe(
        this.get(key),
        this.copy,
        v => v && Object.assign(v, update),
        v => v && this.createOne(key, v));
    
    // Todo: delete 성공이면 true 아니면 false 반환
    deleteOne = (key: string) => this.appMemorySrv.deleteCache(key + this.KEY_SUFFIX);

    /**
     * ### 사용주의 - copy 하지 않은 원본 객체를 반환함.
     */
    get = (key: string) => F.pipe(
        this.appMemorySrv.getValue(key + this.KEY_SUFFIX),
        this.passInstanceOfSchema);
    
    private passInstanceOfSchema = (v: any) => v instanceof this.schema ? v as T : null;

    copy = (v: T | null ) => v && new this.schema(v);

}