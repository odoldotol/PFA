import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DEFAULT_THRESHOLD_PRICE_COUNT } from "../const";
import { AssetEnvKey } from "../enum";
import { AssetEnvironmentVariables } from "../interface";

@Injectable()
export class AssetConfigService {

  constructor(
    private readonly configSrv: ConfigService<AssetEnvironmentVariables>,
  ) {}

  public getPriceThreshold(): number {
    return this.configSrv.get(
      AssetEnvKey.THRESHOLD_PRICE_COUNT,
      DEFAULT_THRESHOLD_PRICE_COUNT,
      { infer: true }
    );
  }
}