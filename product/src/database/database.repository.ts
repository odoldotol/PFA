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

    private backupCacheToLocalfile = async (data: Promise<CacheSet[]>, fileName: string) => {
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

    private setTtlOnCacheSet = (cache: CacheSet) => (cache[0].slice(-12) === this.PS && cache.push(0), cache);
    
    private readCacheBackupFile = async (fileName: string): Promise<CacheSet[]> => JSON.parse(await readFile(`cacheBackup/${fileName}`, 'utf8'));
    
    private getLastCacheBackupFileName = async () => (await readdir('cacheBackup')).pop();

    getAllCacheKeys = (): Promise<CacheKey[]> => this.cacheManager.store.keys();

    private getAllCacheValues = async (): Promise<CacheValue[]> => this.cacheManager.store.mget(...await this.getAllCacheKeys());
    
    private getCacheValue = (key: CacheKey): Promise<CacheValue> => this.cacheManager.get(key);

    private getCache = async (key: CacheKey): Promise<CacheSet> => [key, await this.getCacheValue(key)];

    private setCache(cacheSet: CacheSet): Promise<CacheValue>
    private setCache(key: CacheKey, value: CacheValue): Promise<CacheValue>
    private setCache(key: CacheKey, value: CacheValue, ttl: number): Promise<CacheValue>
    private setCache(arg: CacheKey | CacheSet, value?: CacheValue, ttl?: number) {
        return Array.isArray(arg) ? this.cacheManager.set(...arg) : this.cacheManager.set(arg, value, ttl);
    }

    private cacheReset = () => this.cacheManager.reset();
    
    setPriceStatus = (ISO_Code: string, marketDate: MarketDate) => this.cacheManager.set(ISO_Code+this.PS, marketDate, 0);

    getPriceStatus = (ISO_Code: string): Promise<MarketDate> => this.cacheManager.get(ISO_Code+this.PS);

    setPrice = (symbol: string, price: CachedPrice) => this.cacheManager.set(symbol, price);

    getPrice = (symbol: string): Promise<CachedPrice> => this.cacheManager.get(symbol);

    deletePrice = (symbol: string) => this.cacheManager.del(symbol);

    countingPrice = async (symbol: string) => {
        const price = await this.getPrice(symbol);
        return price ? (price.count++, price) : price;
    }

}