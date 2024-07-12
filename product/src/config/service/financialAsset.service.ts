import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DEFAULT_THRESHOLD_PRICE_COUNT } from "../const";
import { FinancialAssetEnvKey } from "../enum";
import { FinancialAssetEnvironmentVariables } from "../interface";

@Injectable()
export class FinancialAssetConfigService {

  constructor(
    private readonly configSrv: ConfigService<FinancialAssetEnvironmentVariables>,
  ) {}

  public getRenewalThreshold(): number {
    return this.configSrv.get(
      FinancialAssetEnvKey.RENEWAL_THRESHOLD,
      DEFAULT_THRESHOLD_PRICE_COUNT,
      { infer: true }
    );
  }

}
