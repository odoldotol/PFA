import { Injectable, Logger, OnApplicationBootstrap, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as pm2 from "pm2";
import { delay, filter, find, pipe, range, toAsync } from "@fxts/core";

@Injectable()
export class Pm2Service implements OnModuleInit {

    private readonly logger = new Logger(Pm2Service.name);
    private readonly PM2_NAME: string = this.configService.get('PM2_NAME');
    readonly IS_RUN_BY_PM2: boolean;
    private readonly PM2_listen_timeout: number = this.configService.get('listen_timeout');
    private readonly PM2_ID: number;
    private isOld: boolean = false;

    constructor(
        private readonly configService: ConfigService,
    ) {
        if (this.IS_RUN_BY_PM2 = this.PM2_NAME !== undefined)
        // @ts-ignore
        this.getPm2List().then(pm2_pArr => this.PM2_ID = find(this.isPm2ProcessME, pm2_pArr).pm_id);
    }

    onModuleInit() {
        this.IS_RUN_BY_PM2 && this.newProcessReadyListener( // 이게 리슨 안되고 올드프로레스가 죽으면 wait_ready = true 필요하다는 뜻이다.
            () => this.logger.verbose(`I confirmed that New ${this.PM2_ID+'|'+this.PM2_NAME} was ready`));
    }

    private newProcessReadyListener = (action: Function) => new Promise(async resolve =>
        await this.listener(async packet => await this.isNewProcessMsg(packet) && resolve(action())));

    cacheRecoveryListener = (action: Function) => new Promise<void>(async resolve => {
        await this.listener(async packet => this.isCacheRecoveryMsg(packet) && resolve(
            (this.logger.warn("Cache Recovery listener closed"), action())));
        delay(this.PM2_listen_timeout + 3000).then(() => resolve( // PM2_listen_timeout ms + 마진(3s) 이후에 연결 종료
            this.logger.warn("Cache Recovery listener closed")));
        this.logger.warn("Cache Recovery listener opened");
    });

    private listener = async (msgCallBack: Function) => (await this.launchBus()).on('process:msg', msgCallBack);

    private isNewProcessMsg = async packet => 
    packet.raw === 'ready' &&
    packet.process.name === this.PM2_NAME &&
    packet.process.pm_id === this.PM2_ID &&
    await this.am_I_old_process();

    private isCacheRecoveryMsg = packet =>
    packet.process.pm_id === `_old_${this.PM2_ID}` &&
    packet.raw === 'cache_backup_end' &&
    packet.process.name === this.PM2_NAME &&
    !this.isOld;

    private am_I_old_process = async () => this.isOld ? true : this.isOld = await this.oldCheck();
    
    private oldCheck = async () => !this.isPm2ProcessME(find(this.isEqualPm2_id, await this.getPm2List()))
    
    private isPm2ProcessME = (pm2_p: pm2.ProcessDescription) => pm2_p.pid === process.pid;
    
    private isEqualPm2_id = (pm2_p: pm2.ProcessDescription) => pm2_p.pm_id === this.PM2_ID;

    private connectDeamon = (): Promise<boolean> => new Promise(
        (rs) => pm2.connect(false, err => err ? (this.logger.error(err), rs(false)) : rs(true)));

    private disconnect = () => pm2.disconnect();

    private getPm2List = (): Promise<pm2.ProcessDescription[]> => new Promise(
        (rs, rj) => pm2.list((err, list) => err ? rj(err) : rs(list)));

    private launchBus = (): Promise<any> => new Promise(
        (rs, rj) => pm2.launchBus((err, msgBus) => err ? rj(err) : rs(msgBus)));

}