import { Injectable } from "@nestjs/common";
import { AppMemoryService } from "./appMemory.service";
import { MarketDate } from "src/common/class/marketDate.class";
import { CachedPrice } from "src/common/class/cachedPrice.class";
import * as F from "@fxts/core";


@Injectable()
export class AppMemoryRepository<T> {

    private readonly KEY_SUFFIX: string;
    private readonly TTL: number;

    constructor(
        private readonly appMemorySrv: AppMemoryService,
        private readonly schema: InMemorySchema,
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
    createOne = (key: string, value: T) => F.pipe(
        this.appMemorySrv.setCache([key + this.KEY_SUFFIX, new this.schema(value), this.TTL]),
        this.copy);

    findOne = (key: string) => F.pipe(
        this.get(key),
        this.copy);
    
    // Todo: 존재하는 키만 set 허용하기
    updateOne = (key: string, update: Partial<T>) => F.pipe(
        this.get(key),
        this.copy,
        v => v && Object.assign(v, update), // Todo: marketDate(string 같은 불변타입) 솔루션
        v => v && this.createOne(key, v));
    
    // Todo: 존재하는 키만 del 허용하기
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