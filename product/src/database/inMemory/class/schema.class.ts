import { CachedPrice } from "src/common/class/cachedPrice.class";
import { MarketDate } from "src/common/class/marketDate.class";

export class InMemorySchema {

    readonly name: string;

    constructor(
        private readonly KEY_PREFIX: string,
        private readonly TTL: number | null,
        private readonly CLASS: any // 임시
    ) {
        this.name = CLASS.name;
    }

    get keyPrefix() {return this.KEY_PREFIX;}
    get ttl() {return this.TTL;}
    get schemaClass() {return this.CLASS;} // 임시
}

export const priceSchema = new InMemorySchema("price:", 60 * 60 * 24 * 5, CachedPrice);
export const marketDateSchema = new InMemorySchema("marketdate:", null, MarketDate);