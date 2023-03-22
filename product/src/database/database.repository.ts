import { CACHE_MANAGER, Inject, Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { Cache } from 'cache-manager';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { curry, each, map, pipe, toArray, toAsync } from "@fxts/core";
import { Pm2Service } from "src/pm2/pm2.service";

@Injectable()
export class DBRepository implements OnModuleDestroy {

    private readonly logger = new Logger(DBRepository.name);
    private readonly PS = "_priceStatus";

    constructor(
        private readonly pm2Service: Pm2Service,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
    ) {}

    async onModuleDestroy() {
        await this.backupCacheToLocalfile(this.getAllCache(), new Date().toISOString());
        this.pm2Service.IS_RUN_BY_PM2 && process.send('cache_backup_end');
    }

    private backupCacheToLocalfile = async (data: Promise<CacheSet<CacheValue>[]>, fileName: string) => {
        this.logger.warn(`Cache Backup Start`);
        await writeFile(`cacheBackup/${fileName}`, JSON.stringify(await data, null, 4));
        this.logger.warn(`Cache Backup End : ${fileName}`);
    }

    cacheRecovery = async () => this.localFileCacheRecovery(await this.getLastCacheBackupFileName())
        .catch(e => (this.logger.error(e.stack), this.logger.error(`Failed to Cache Recovery`)));
    
    private getAllCache = () => pipe(
        this.getAllCacheKeys(), toAsync,
        map(this.getCache),
        toArray
    );

    localFileCacheRecovery = (fileName: string) => pipe(
        this.readCacheBackupFile(fileName), toAsync,
        map(this.setTtlOnCacheSet),
        each(this.setCache.bind(this)),
    ).then(() => this.logger.verbose(`Cache Recovered : ${fileName}`));

    private setTtlOnCacheSet = (cache: CacheSet<CacheValue>) => (cache[0].slice(-12) === this.PS && cache.push(0), cache);
    
    private readCacheBackupFile = async (fileName: string): Promise<CacheSet<CacheValue>[]> => JSON.parse(await readFile(`cacheBackup/${fileName}`, 'utf8'));
    
    private getLastCacheBackupFileName = async () => (await readdir('cacheBackup')).pop();
    
    setPriceStatus = (ISO_Code: ISO_Code, marketDate: MarketDate) => this.setCache(ISO_Code+this.PS, marketDate, 0);
    
    setPriceAndGetCopy = (symbol: TickerSymbol, price: CachedPrice) => this.setCache(symbol, price).then(this.copy);
    
    getPriceStatus = (ISO_Code: ISO_Code) => this.getCacheValue(ISO_Code+this.PS).then(this.passMarketDate);

    updatePriceAndGetCopy = async (symbol: TickerSymbol, update: Partial<CachedPrice>) => this.copy(this.update(await this.getPrice(symbol), update));
    
    countingGetPriceCopy = (symbol: TickerSymbol) => this.getPrice(symbol).then(v => v && (v.count++, v)).then(this.copy);

    getPriceCopy = (symbol: TickerSymbol) => this.getPrice(symbol).then(this.copy);

    private getPrice = (symbol: TickerSymbol) => this.getCacheValue(symbol).then(this.passCachedPrice);
    
    private copy = <T>(v: T): T => v && Object.assign({}, v);

    private update = <T>(v: T, update: Partial<T>): T => v && Object.assign(v, update);

    private passMarketDate = (v: CacheValue) => typeof v === 'string' && v;
    
    private passCachedPrice = (v: CacheValue) => v instanceof Object && v;

    private setCache<T>(cacheSet: CacheSet<T>): Promise<T>
    private setCache<T>(key: CacheKey, value: T): Promise<T>
    private setCache<T>(key: CacheKey, value: T, ttl: number): Promise<T>
    private setCache<T>(arg: CacheKey | CacheSet<T>, value?: T, ttl?: number) {
        return Array.isArray(arg) ? this.cacheManager.set(...arg) : this.cacheManager.set(arg, value, ttl);
    }

    private getCache = async (key: CacheKey): Promise<CacheSet<CacheValue>> => [key, await this.getCacheValue(key)];

    private getCacheValue = (key: CacheKey): Promise<CacheValue> => this.cacheManager.get(key);

    private getAllCacheValues = async (): Promise<CacheValue[]> => this.cacheManager.store.mget(...await this.getAllCacheKeys());

    getAllCacheKeys = (): Promise<CacheKey[]> => this.cacheManager.store.keys();

    deleteCache = (key: CacheKey) => this.cacheManager.del(key);

    private cacheReset = () => this.cacheManager.reset();

}