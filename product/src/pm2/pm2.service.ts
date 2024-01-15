import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as pm2 from "pm2";
import { EnvironmentVariables } from "src/common/interface/environmentVariables.interface";
import { EnvKey } from "src/common/enum/envKey.emun";
import * as F from "@fxts/core";

@Injectable()
export class Pm2Service implements OnModuleInit {

  private readonly logger = new Logger(Pm2Service.name);
  private readonly PM2_NAME
  = this.configService.get(EnvKey.PM2_NAME, { infer: true });
  public readonly IS_RUN_BY_PM2: boolean;
  private readonly PM2_listen_timeout
  = this.configService.get(EnvKey.PM2_LISTEN_TIMEOUT, 60000, { infer: true });
  private PM2_ID!: number; // onModuleInit 에서 할당된 이후 상수 이어야 함.
  private msgBus: any;
  private isOld: boolean = false;

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {
    this.IS_RUN_BY_PM2 = F.not(F.isUndefined(this.PM2_NAME));
  }

  async onModuleInit() {
    if (this.IS_RUN_BY_PM2) {
      await this.identify(); // PM2_ID 할당
    }

    this.IS_RUN_BY_PM2 &&
    (this.msgBus = await this.launchBus()) &&
    this.listenNewProcessReady(
      // 이게 리슨 안되고 올드프로레스가 죽으면 wait_ready = true 필요하다는 뜻이다.
      () => this.logger.verbose(`It confirmed that New ${this.PM2_ID + '|' + this.PM2_NAME} was ready`)
    );
  }

  // 더이상 필요 없는 메소드 아닌가?
  public listenOldProcessCacheRecovery(listener: () => void) {
    return new Promise<void>(resolve => {
      this.addlistener((packet: any) =>
        this.isCacheRecoveryMsgFromOldProcess(packet) &&
        resolve((this.logger.verbose("Cache Recovery listener closed"), listener()))
      );
      
      F.delay(this.PM2_listen_timeout + 3000)
      .then(() => {
        listener = F.noop;
        resolve(this.logger.verbose("Cache Recovery listener closed"));
      });
      this.logger.verbose("Cache Recovery listener opened");
    });
  }

  private identify() {
    return F.pipe(
      this.getPm2List(),
      F.find(this.isProcessIdEqualMine),
      pm2_p => this.PM2_ID = pm2_p!.pm_id!, // !!
    );
  }

  private launchBus(): Promise<any> {
    return new Promise((resolve, reject) =>
    pm2.launchBus((err, msgBus) => err ?
      reject(err) :
      resolve(msgBus)
    ));
  }

  private listenNewProcessReady(listener: () => void) {
    this.addlistener(async (packet: any) => {
      await this.isReadyMsgFromNewProcess(packet) &&
      listener()
    });
  }

  private getPm2List(): Promise<pm2.ProcessDescription[]> {
    return new Promise((resolve, reject) =>
    pm2.list((err, list) => err ?
      reject(err) :
      resolve(list)
    ));
  }

  private isProcessIdEqualMine(pm2_p?: pm2.ProcessDescription) {
    return pm2_p?.pid === process.pid; // ?
  }

  private addlistener(msgCallBack: Listener) {
    this.msgBus.on('process:msg', msgCallBack);
  }

  private async isReadyMsgFromNewProcess(packet: any) {
    return packet.raw === 'ready' &&
    packet.process.name === this.PM2_NAME &&
    packet.process.pm_id === this.PM2_ID &&
    await this.isOldNow();
  }

  private isCacheRecoveryMsgFromOldProcess(packet: any) {
    return packet.process.pm_id === `_old_${this.PM2_ID}` &&
    packet.raw === 'cache_backup_end' &&
    packet.process.name === this.PM2_NAME &&
    F.not(this.isOld);
  }

  private async isOldNow() {
    return this.isOld ?
      true :
      this.isOld = await this.oldCheck();
  }

  private oldCheck() {
    return F.pipe(
      this.getPm2List(),
      F.find(this.isPm2IdEqualMine.bind(this)),
      this.isProcessIdEqualMine,
      F.not
    );
  }

  private isPm2IdEqualMine(pm2_p: pm2.ProcessDescription) {
    return pm2_p.pm_id === this.PM2_ID;
  }

}

type Listener = (packet: any) => void;