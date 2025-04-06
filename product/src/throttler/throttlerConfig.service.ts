import { Injectable } from "@nestjs/common";
import {
  ThrottlerModuleOptions,
  ThrottlerOptionsFactory
} from "@nestjs/throttler";
import { ThrottleConfigService } from "src/config";

@Injectable()
export class ThrottlerConfigService
  implements ThrottlerOptionsFactory
{
  constructor(
    private readonly throttleConfigSrv: ThrottleConfigService,
  ) {}

  createThrottlerOptions(): ThrottlerModuleOptions {
    return {
      throttlers: [
        {
          name: 'short',
          ttl: this.throttleConfigSrv.getTtlGlobalShort(),
          limit: this.throttleConfigSrv.getLimitGlobalShort(),
        },
        {
          name: 'medium',
          ttl: this.throttleConfigSrv.getTtlGlobalMedium(),
          limit: this.throttleConfigSrv.getLimitGlobalMedium(),
        },
        {
          name: 'long',
          ttl: this.throttleConfigSrv.getTtlGlobalLong(),
          limit: this.throttleConfigSrv.getLimitGlobalLong(),
        },
        {
          name: 'cut',
          ttl: this.throttleConfigSrv.getTtlGlobalCut(),
          limit: this.throttleConfigSrv.getLimitGlobalCut(),
        },
      ],
    };
  }
}
