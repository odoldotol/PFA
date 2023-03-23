import { CACHE_MANAGER, Inject, Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { Cache } from 'cache-manager';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { curry, each, map, pipe, toArray, toAsync } from "@fxts/core";
import { Pm2Service } from "../../pm2/pm2.service";
import { MarketDate } from "../../class/marketDate.class";
import { CachedPrice } from "../../class/cachedPrice.class";

@Injectable()
export class IMCacheRepository implements OnModuleDestroy {

    private readonly logger = new Logger(IMCacheRepository.name);
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

    recovery = async () => pipe(
        this.getLastCacheBackupFileName(),
        this.localFileCacheRecovery
    ).catch(e => (this.logger.error(e.stack), this.logger.error(`Failed to Cache Recovery`)));
    
    private getAllCache = () => pipe(
        this.getAllKeys(), toAsync,
        map(this.getKeyValueSet), toArray
    );

    private localFileCacheRecovery = (fileName: string) => pipe(
        this.readCacheBackupFile(fileName), toAsync,
        map(this.toCacheSet),
        each(this.setOne.bind(this)),
    ).then(() => this.logger.verbose(`Cache Recovered : ${fileName}`));

    private toCacheSet = (cache: CacheSet<BackupCacheValue>) => pipe(cache,
        this.toCachedPrice,
        this.toMarketDate
    );

    private toMarketDate = (cache: CacheSet<BackupCacheValue>) => 
        (this.isPricaStatus(cache) && typeof cache[1] === 'string') ?
        [cache[0], new MarketDate(cache[1]), 0]
        : cache;

    private toCachedPrice = (cache: CacheSet<BackupCacheValue>) =>
        (cache[1] instanceof MarketDate === false && typeof cache[1] === 'object') ?
        [cache[0], new CachedPrice(cache[1])]
        : cache;
    
    private readCacheBackupFile = async (fileName: string): Promise<CacheSet<BackupCacheValue>[]> => JSON.parse(await readFile(`cacheBackup/${fileName}`, 'utf8'));
    
    private getLastCacheBackupFileName = async () => (await readdir('cacheBackup')).pop();
    
    setMarketDate = (ISO_Code: ISO_Code, marketDate: MarketDate) => this.setOne(ISO_Code+this.PS, marketDate, 0);
    
    setPriceAndGetCopy = (symbol: TickerSymbol, price: CachedPrice) => pipe(
        this.setOne(symbol, price),
        this.copy);
    
    updatePriceAndGetCopy = async (symbol: TickerSymbol, update: Partial<CachedPrice>) => pipe(
        this.update(await this.getPrice(symbol), update),
        this.copy);
    
    countingGetPriceCopy = (symbol: TickerSymbol) => pipe(symbol,
        this.getPrice,
        this.counting,
        this.copy);
    
    getPriceCopy = (symbol: TickerSymbol) => pipe(symbol,
        this.getPrice,
        this.copy);
    
    getMarketDate = (ISO_Code: ISO_Code) => pipe(ISO_Code+this.PS,
        this.getValue,
        this.passMarketDate);

    private getPrice = (symbol: TickerSymbol) => pipe(symbol,
        this.getValue,
        this.passCachedPrice);

    private counting = (v: CachedPrice) => v && v.counting();
    
    private copy = <T>(v: T): T => v && Object.assign({}, v);

    private update = <T>(v: T, update: Partial<T>): T => v && Object.assign(v, update);

    private passMarketDate = (v: CacheValue) => v instanceof MarketDate && v;
    
    private passCachedPrice = (v: CacheValue) => v instanceof CachedPrice && v;

    private isPricaStatus = (cache: CacheSet<any>) => cache[0].slice(-12) === this.PS

    private setOne<T>(cacheSet: CacheSet<T>): Promise<T>
    private setOne<T>(key: CacheKey, value: T): Promise<T>
    private setOne<T>(key: CacheKey, value: T, ttl: number): Promise<T>
    private setOne<T>(arg: CacheKey | CacheSet<T>, value?: T, ttl?: number) {
        return Array.isArray(arg) ? this.cacheManager.set(...arg) : this.cacheManager.set(arg, value, ttl);
    }

    private getKeyValueSet = async (key: CacheKey): Promise<CacheSet<CacheValue>> => [key, await this.getValue(key)];

    private getValue = (key: CacheKey): Promise<CacheValue> => this.cacheManager.get(key);

    private getAllValues = async (): Promise<CacheValue[]> => this.cacheManager.store.mget(...await this.getAllKeys());

    getAllKeys = (): Promise<CacheKey[]> => this.cacheManager.store.keys();

    deleteOne = (key: CacheKey) => this.cacheManager.del(key);

    private reset = () => this.cacheManager.reset();

}