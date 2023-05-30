import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { Pm2Service } from "src/pm2/pm2.service";
import { MarketDate } from "src/common/class/marketDate.class";
import { CachedPrice } from "src/common/class/cachedPrice.class";
import { AppMemoryService } from "./appMemory/appMemory.service";
import { curry, each, gte, head, isObject, isString, last, lte, map, not, nth, pipe, tap, toArray, toAsync, zip } from "@fxts/core";

@Injectable()
export class BackupService implements OnApplicationBootstrap, OnModuleDestroy {

    private readonly logger = new Logger("InMemory_" + BackupService.name);

    constructor(
        private readonly schedulerRegistry: SchedulerRegistry,
        private readonly pm2Service: Pm2Service,
        private readonly storeSrv: AppMemoryService,
    ) {}

    // Todo: Refac - 캐시모듈 전체적으로 조악하다.

    onApplicationBootstrap = () => this.backupPlanner();

    onModuleDestroy = async () => {
        await this.backupCache();
        this.pm2Service.IS_RUN_BY_PM2 && process.send && process.send('cache_backup_end');};

    private backupPlanner = () => this.schedulerRegistry.doesExist("cron", "dailyCacheBackup") ?
        this.backupCache().then(() => this.logger_backupPlan(this.schedulerRegistry.getCronJob("dailyCacheBackup")))
        : pipe(
            new CronJob("0 0 11 * * *", this.backupPlanner),
            tap(job => this.schedulerRegistry.addCronJob("dailyCacheBackup", job)),
            tap(job => job.start()),
            job => this.logger_backupPlan(job)
        );
    
    private logger_backupPlan = (cronJob: CronJob) => this.logger.log(`Backup Plan : ${(new Date(cronJob.nextDate().toString())).toLocaleString()}`);

    private backupCache = () => this.backupCacheToLocalfile(this.storeSrv.getAllCache(), new Date().toISOString());

    private backupCacheToLocalfile = async (data: Promise<CacheSet<CacheValue>[]>, fileName: string) => {
        this.logger.warn(`Cache Backup Start`);
        await writeFile(`cacheBackup/${fileName}`, JSON.stringify(await data, null, 4));
        this.logger.warn(`Cache Backup End : ${fileName}`);
    }

    localFileCacheRecovery = async (fileName?: string) => pipe(
        fileName ? fileName : fileName = await this.getLastCacheBackupFileName(),
        this.readCacheBackupFile,
        map(this.toCacheSet),
        each(this.storeSrv.setCache)
    ).then(() => this.logger.verbose(`Cache Recovered : ${fileName}`)
    ).catch(e => {this.logger.error(e.stack), this.logger.error(`Failed to Cache Recovery`); throw e});
    
    private getLastCacheBackupFileName = async () => await readdir('cacheBackup')
        .then(a => {
            const res = last(a);
            if (res) return res;
            else throw new Error(`Cache Backup File Not Found`);
        });

    private readCacheBackupFile = async (fileName: string): Promise<CacheSet<BackupCacheValue>[]> =>
        JSON.parse(await readFile(`cacheBackup/${fileName}`, 'utf8'));

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
        [ head(cache), new MarketDate(cache[1]), 0 ] as CacheSet<MarketDate>
        : cache;

    private isPriceStatus = <T>(cacheSet: CacheSet<T>) => head(cacheSet).slice(-12) === this.storeSrv.marketDate_keySuffix;

}