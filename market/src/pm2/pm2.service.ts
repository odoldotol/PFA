// Pm2 는 제거되어야함

import {
    Injectable,
    Logger,
    // OnApplicationBootstrap,
    OnModuleInit
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as pm2 from "pm2";
import { EnvKey } from "src/common/enum/envKey.enum";
import { EnvironmentVariables } from "src/common/interface/environmentVariables.interface";
import * as F from "@fxts/core";

@Injectable()
export class Pm2Service implements OnModuleInit {

    private readonly logger = new Logger(Pm2Service.name);
    private readonly PM2_NAME = this.configService.get(EnvKey.PM2_NAME, { infer: true });
    readonly IS_RUN_BY_PM2: boolean;
    // private readonly PM2_listen_timeout = this.configService.get(EnvKey.PM2_LISTEN_TIMEOUT, { infer: true });
    private readonly PM2_ID!: number;
    private msgBus: any;
    private isOld: boolean = false;

    constructor(
        private readonly configService: ConfigService<EnvironmentVariables>,
    ) {
        if (this.IS_RUN_BY_PM2 = F.not(F.isUndefined(this.PM2_NAME))) Pm2Service.identify(this);
    }

    onModuleInit = async () => {
        this.IS_RUN_BY_PM2 &&
        (this.msgBus = await this.launchBus()) &&
        this.newProcessReadyListener( // 이게 리슨 안되고 올드프로레스가 죽으면 wait_ready = true 필요하다는 뜻이다.
            () => this.logger.verbose(`I confirmed that New ${this.PM2_ID+'|'+this.PM2_NAME} was ready`));};

    private newProcessReadyListener = (action: Function) => new Promise(resolve =>
        this.listener(async (packet: any) => await this.isReadyMsgFromNewProcess(packet) && resolve(action()))); // any

    private listener = (msgCallBack: Function) => this.msgBus.on('process:msg', msgCallBack);

    private isReadyMsgFromNewProcess = async (packet: any) => // any
        packet.raw === 'ready' &&
        packet.process.name === this.PM2_NAME &&
        packet.process.pm_id === this.PM2_ID &&
        await this.am_I_old_process_now();

    private am_I_old_process_now = async () => this.isOld ? true : this.isOld = await this.oldCheck();
    
    private oldCheck = () => F.pipe(
        this.getPm2List(),
        F.find(this.isPm2IdEqualMine),
        this.isProcessIdEqualMine, F.not);
    
    private isProcessIdEqualMine = (pm2_p?: pm2.ProcessDescription) => pm2_p?.pid === process.pid; // ?
    
    private isPm2IdEqualMine = (pm2_p: pm2.ProcessDescription) => pm2_p.pm_id === this.PM2_ID;

    // private connectDeamon = (): Promise<boolean> => new Promise((rs) =>
    //     pm2.connect(false, err => err ? (this.logger.error(err), rs(false)) : rs(true)));

    // private disconnect = () => pm2.disconnect();

    private getPm2List = (): Promise<pm2.ProcessDescription[]> => new Promise((rs, rj) =>
        pm2.list((err, list) => err ? rj(err) : rs(list)));

    private launchBus = (): Promise<any> => new Promise((rs, rj) =>
        pm2.launchBus((err, msgBus) => err ? rj(err) : rs(msgBus)));

    private static identify = (pm2Service: Pm2Service) => F.pipe(
        pm2Service.getPm2List(),
        F.find(pm2Service.isProcessIdEqualMine),
        Pm2Service.setPM2_ID(pm2Service)
    );

    private static setPM2_ID = F.curry((pm2Service: Pm2Service, pm2_p: pm2.ProcessDescription) =>
        // @ts-ignore
        pm2Service.PM2_ID = pm2_p.pm_id);

}