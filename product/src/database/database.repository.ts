import { CACHE_MANAGER, Inject, Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { curry, each, map, pipe, toArray, toAsync } from "@fxts/core";

@Injectable()
export class DBRepository implements OnModuleDestroy {

    private readonly logger = new Logger(DBRepository.name);
    private readonly PS = "_priceStatus";
    private readonly PM2_NAME: string = this.configService.get('PM2_NAME');

    constructor(
        private readonly configService: ConfigService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {}

    /**
     * ### 앱 종료시 캐시 백업
     */
    async onModuleDestroy(signal?: string) {
        this.logger.warn(`Cache Backup Start`);
        const allKey: string[] = await this.cacheManager.store.keys();
        const allVal = await this.cacheManager.store.mget(...allKey);
        const allCache = allKey.map((key, idx) => ([key, allVal[idx]]));
        const backupFileName = new Date().toISOString();
        await writeFile(`cacheBackup/${backupFileName}`, JSON.stringify(allCache, null, 4));
        this.PM2_NAME && process.send('cache_backup_end');
        this.logger.warn(`Cache Backup End : ${backupFileName}`);
    }

    cacheReset = () => this.cacheManager.reset();

    /**
     * ### cacheRecovery
     * - readLastCacheBackup 로 복구
     */
    cacheRecovery = async () => {
        try {
            const [lastCacheBackupFileName, lastCacheBackup] = await this.readLastCacheBackup();
            await each(cache => this.cacheManager.set(cache[0], cache[1]), toAsync(lastCacheBackup));
            this.logger.verbose(`Cache Recovered : ${lastCacheBackupFileName}`)
        } catch (e) {
            this.logger.error(e), this.logger.error(`Failed to Cache Recovery`);
        };
    }

    /**
     * ### readLastCacheBackup
     */
    private readLastCacheBackup = async (): Promise<[string, Array<[string,string|CachedPrice]>]> => {
        const lastCacheBackupFileName = (await readdir('cacheBackup')).pop();
        return [lastCacheBackupFileName, JSON.parse(await readFile(`cacheBackup/${lastCacheBackupFileName}`, 'utf8'))];
    }

    /**
     * ### setPriceStatus
     */
    setPriceStatus = (ISO_Code: string, marketDate: string) => this.cacheManager.set(ISO_Code+this.PS, marketDate, 0);

    /**
     * ### getPriceStatus
     */
    getPriceStatus = (ISO_Code: string): Promise<string> => this.cacheManager.get(ISO_Code+this.PS);

    /**
     * ### setPrice
     */
    setPrice = (symbol: string, price: CachedPrice) => this.cacheManager.set(symbol, price);

    /**
     * ### getPrice
     */
    getPrice = (symbol: string): Promise<CachedPrice> => this.cacheManager.get(symbol);

    /**
     * ### countingPrice
     * - count 1 증가
     */
    countingPrice = async (symbol: string) => {
        try {
            const price = await this.getPrice(symbol);
            price.count++;
            return price;
        } catch (e) {
            return undefined;
        }
    }

    /**
     * ### deletePrice
     */
    deletePrice = (symbol: string) => this.cacheManager.del(symbol);

    /**
     * ###
     */
    getAllCachedKeys = () => this.cacheManager.store.keys();
}