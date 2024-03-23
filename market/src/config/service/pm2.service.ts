// Todo: 제거

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Pm2EnvKey } from "../enum";
import { Pm2EnvironmentVariables } from "../interface";

@Injectable()
export class Pm2ConfigService {

  private readonly PM2_NAME: string | undefined;
  private readonly LISTEN_TIMEOUT_DEFAULT = 60000;

  constructor(
    private readonly configSrv: ConfigService<Pm2EnvironmentVariables>,
  ) {
    this.PM2_NAME = this.configSrv.get(Pm2EnvKey.NAME, { infer: true });
  }

  /**
   * 초기화때 PM2_NAME 이 존재하면 true. or not, false.
   */
  public isRunByPm2(): boolean {
    return this.PM2_NAME !== undefined;
  }

  /**
   * isRunByPm2() === true 라면 string 이다.
   */
  public getName(): string | null {
    if (this.PM2_NAME === undefined) {
      return null;
    } else {
      return this.PM2_NAME;
    }
  }

  public getListenTimeout(): number {
    return this.configSrv.get(
      Pm2EnvKey.LISTEN_TIMEOUT,
      this.LISTEN_TIMEOUT_DEFAULT,
      { infer: true }
    );
  }
}
