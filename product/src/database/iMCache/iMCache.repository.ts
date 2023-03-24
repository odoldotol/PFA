import { CACHE_MANAGER, Inject, Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cache } from 'cache-manager';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { curry, each, gte, head, isObject, isString, last, map, not, pipe, toArray, toAsync } from "@fxts/core";
import { Pm2Service } from "../../pm2/pm2.service";
import { MarketDate } from "../../class/marketDate.class";
import { CachedPrice } from "../../class/cachedPrice.class";

@Injectable()
export class IMCacheRepository implements OnModuleDestroy {

    private readonly logger = new Logger(IMCacheRepository.name);
    private readonly PS = "_priceStatus";
    private readonly priceCacheCount: number = this.configService.get('PRICE_CACHE_COUNT');

    constructor(
        private readonly configService: ConfigService,
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

    localFileCacheRecovery = async (fileName?: string) => pipe(
        fileName ? fileName : fileName = await this.getLastCacheBackupFileName(),
        this.readCacheBackupFile,
        map(this.toCacheSet),
        each(this.setOne.bind(this))
    ).then(() => this.logger.verbose(`Cache Recovered : ${fileName}`)
    ).catch(e => {this.logger.error(e.stack), this.logger.error(`Failed to Cache Recovery`); throw e});
    
    private getLastCacheBackupFileName = async () => last(await readdir('cacheBackup'));

    private readCacheBackupFile = async (fileName: string): Promise<CacheSet<BackupCacheValue>[]> =>
        JSON.parse(await readFile(`cacheBackup/${fileName}`, 'utf8'));

    private getAllCache = () => pipe(
        this.getAllKeys(), toAsync,
        map(this.getKeyValueSet), toArray);

    // TODO: 그냥통과된 BackupCache 있는지 확인하는 함수 pipe 에 넣기
    private toCacheSet = (cache: CacheSet<BackupCacheValue>) => pipe(cache,
        this.toCachedPrice,
        this.toMarketDate);

    private toCachedPrice = (cache: CacheSet<BackupCacheValue>) =>
        ( not(cache[1] instanceof MarketDate) && isObject(cache[1]) ) ?
        [ head(cache), new CachedPrice(cache[1]) ] as CacheSet<CachedPrice>
        : cache;

    private toMarketDate = (cache: CacheSet<BackupCacheValue>) => 
        ( this.isPriceStatus(cache) && isString(cache[1]) ) ?
        [ head(cache), new MarketDate(cache[1]), 0 ] as CacheSet2<MarketDate>
        : cache;
    
    setMarketDate = (sp: Sp) => this.setOne(head(sp)+this.PS, last(sp), 0);
    
    setPriceAndGetCopy = ([symbol, price]: CacheSet<CachedPriceI>, ttl?: number) => 
        this.setOne(symbol, new CachedPrice(price));
    
    updatePriceAndGetCopy = async ([symbol, update]: CacheUpdateSet<CachedPriceI>) =>
        this.update(await this.getPrice(symbol), update);

    isGteMinCount = (set: PSet | PSet2) => pipe(head(set),
        this.getPriceCopy,
        v => gte(v.count, this.priceCacheCount));
    
    countingGetPriceCopy = (symbol: TickerSymbol) => pipe(symbol,
        this.getPrice,
        this.counting);
    
    getPriceCopy = (symbol: TickerSymbol) => this.getPrice(symbol);
    
    getMarketDate = (ISO_Code: ISO_Code) => pipe(ISO_Code+this.PS,
        this.getValue,
        this.passMarketDate);

    private getPrice = (symbol: TickerSymbol) => pipe(symbol,
        this.getValue,
        this.passCachedPrice);

    private counting = (v: CachedPrice) => v && v.counting();
    
    private copy = <T>(v: T): T => v && Object.assign({}, v, {copy: true});

    private update = <T>(v: T, update: Partial<T>): T => v && Object.assign(v, update);

    private passMarketDate = (v: CacheValue) => v instanceof MarketDate && v;
    
    private passCachedPrice = (v: CacheValue) => v instanceof CachedPrice && v;

    private isPriceStatus = <T>(cacheSet: CacheSet<T>) => head(cacheSet).slice(-12) === this.PS

    private setOne<T>(cacheSet: CacheSet<T>): Promise<T>
    private setOne<T>(key: CacheKey, value: T): Promise<T>
    private setOne<T>(key: CacheKey, value: T, ttl: number): Promise<T>
    private setOne<T>(arg: CacheKey | CacheSet<T>, value?: T, ttl?: number) {
        return Array.isArray(arg) ? this.cacheManager.set(...arg) : this.cacheManager.set(arg, value, ttl);
    }

    private getKeyValueSet = async (key: CacheKey) => [ key, await this.getValue(key) ] as CacheSet<CacheValue>;

    private getValue = (key: CacheKey): Promise<CacheValue> => this.cacheManager.get(key);

    private getAllValues = async (): Promise<CacheValue[]> => this.cacheManager.store.mget(...await this.getAllKeys());

    getAllKeys = (): Promise<CacheKey[]> => this.cacheManager.store.keys();

    deleteOne = (key: CacheKey) => this.cacheManager.del(key);

    private reset = () => this.cacheManager.reset();

}