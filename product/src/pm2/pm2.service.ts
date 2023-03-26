import { Injectable, Logger, OnApplicationBootstrap, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as pm2 from "pm2";
import { curry, delay, filter, find, isUndefined, not, pipe, range, toAsync } from "@fxts/core";

@Injectable()
export class Pm2Service implements OnModuleInit {

    private readonly logger = new Logger(Pm2Service.name);
    private readonly PM2_NAME: string = this.configService.get('PM2_NAME');
    readonly IS_RUN_BY_PM2: boolean;
    private readonly PM2_listen_timeout: number = this.configService.get('listen_timeout');
    private readonly PM2_ID: number;
    private msgBus: any;
    private isOld: boolean = false;

    constructor(
        private readonly configService: ConfigService,
    ) {
        if (this.IS_RUN_BY_PM2 = not(isUndefined(this.PM2_NAME))) Pm2Service.identify(this);
    }

    onModuleInit = async () => {
        this.IS_RUN_BY_PM2 &&
        (this.msgBus = await this.launchBus()) &&
        this.newProcessReadyListener( // 이게 리슨 안되고 올드프로레스가 죽으면 wait_ready = true 필요하다는 뜻이다.
            () => this.logger.verbose(`I confirmed that New ${this.PM2_ID+'|'+this.PM2_NAME} was ready`));};

    private newProcessReadyListener = (action: Function) => new Promise(resolve =>
        this.listener(async packet => await this.isReadyMsgFromNewProcess(packet) && resolve(action())));

    cacheRecoveryListener = (action: Function) => new Promise<void>(resolve => {
        this.listener(packet => this.isCacheRecoveryMsgFromOldProcess(packet) && resolve(
            (this.logger.warn("Cache Recovery listener closed"), action())));
        delay(this.PM2_listen_timeout + 3000).then(() => resolve(
            this.logger.warn("Cache Recovery listener closed")));
        this.logger.warn("Cache Recovery listener opened");
    });

    private listener = (msgCallBack: Function) => this.msgBus.on('process:msg', msgCallBack);

    private isReadyMsgFromNewProcess = async packet => 
        packet.raw === 'ready' &&
        packet.process.name === this.PM2_NAME &&
        packet.process.pm_id === this.PM2_ID &&
        await this.am_I_old_process_now();

    private isCacheRecoveryMsgFromOldProcess = packet =>
        packet.process.pm_id === `_old_${this.PM2_ID}` &&
        packet.raw === 'cache_backup_end' &&
        packet.process.name === this.PM2_NAME &&
        not(this.isOld);

    private am_I_old_process_now = async () => this.isOld ? true : this.isOld = await this.oldCheck();
    
    private oldCheck = () => pipe(
        this.getPm2List(),
        find(this.isPm2IdEqualMine),
        this.isProcessIdEqualMine, not);
    
    private isProcessIdEqualMine = (pm2_p: pm2.ProcessDescription) => pm2_p.pid === process.pid;
    
    private isPm2IdEqualMine = (pm2_p: pm2.ProcessDescription) => pm2_p.pm_id === this.PM2_ID;

    private connectDeamon = (): Promise<boolean> => new Promise((rs) =>
        pm2.connect(false, err => err ? (this.logger.error(err), rs(false)) : rs(true)));

    private disconnect = () => pm2.disconnect();

    private getPm2List = (): Promise<pm2.ProcessDescription[]> => new Promise((rs, rj) =>
        pm2.list((err, list) => err ? rj(err) : rs(list)));

    private launchBus = (): Promise<any> => new Promise((rs, rj) =>
        pm2.launchBus((err, msgBus) => err ? rj(err) : rs(msgBus)));

    private static identify = (pm2Service: Pm2Service) => pipe(
        pm2Service.getPm2List(),
        find(pm2Service.isProcessIdEqualMine),
        Pm2Service.setPM2_ID(pm2Service));

    private static setPM2_ID = curry((pm2Service: Pm2Service, pm2_p: pm2.ProcessDescription) =>
        // @ts-ignore
        pm2Service.PM2_ID = pm2_p.pm_id);

}