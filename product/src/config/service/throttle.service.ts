import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ThrottleEnvironmentVariables } from "../interface";
import { ThrottleEnvKey } from "../enum";
import {
  DEFAULT_THROTTLE_LIMIT_LONG,
  DEFAULT_THROTTLE_LIMIT_SHORT,
  DEFAULT_THROTTLE_TTL_LONG,
  DEFAULT_THROTTLE_TTL_SHORT
} from "../const";

@Injectable()
export class ThrottleConfigService {

  constructor(
    private readonly configSrv: ConfigService<ThrottleEnvironmentVariables>,
  ) {}

  public getTtlGlobalShort(): number {
    return this.configSrv.get(
      ThrottleEnvKey.TTL_GLOBAL_SHORT,
      DEFAULT_THROTTLE_TTL_SHORT,
      { infer: true }
    );
  }

  public getLimitGlobalShort(): number {
    return this.configSrv.get(
      ThrottleEnvKey.LIMIT_GLOBAL_SHORT,
      DEFAULT_THROTTLE_LIMIT_SHORT,
      { infer: true }
    );
  }

  public getTtlGlobalLong(): number {
    return this.configSrv.get(
      ThrottleEnvKey.TTL_GLOBAL_LONG,
      DEFAULT_THROTTLE_TTL_LONG,
      { infer: true }
    );
  }

  public getLimitGlobalLong(): number {
    return this.configSrv.get(
      ThrottleEnvKey.LIMIT_GLOBAL_LONG,
      DEFAULT_THROTTLE_LIMIT_LONG,
      { infer: true }
    );
  }

  public getTtlKakaoChatbotShort(): number {
    return this.configSrv.get(
      ThrottleEnvKey.TTL_KAKAO_CHATBOT_SHORT,
      DEFAULT_THROTTLE_TTL_SHORT,
      { infer: true }
    );
  }

  public getLimitKakaoChatbotShort(): number {
    return this.configSrv.get(
      ThrottleEnvKey.LIMIT_KAKAO_CHATBOT_SHORT,
      DEFAULT_THROTTLE_LIMIT_SHORT,
      { infer: true }
    );
  }

  public getTtlKakaoChatbotLong(): number {
    return this.configSrv.get(
      ThrottleEnvKey.TTL_KAKAO_CHATBOT_LONG,
      DEFAULT_THROTTLE_TTL_LONG,
      { infer: true }
    );
  }

  public getLimitKakaoChatbotLong(): number {
    return this.configSrv.get(
      ThrottleEnvKey.LIMIT_KAKAO_CHATBOT_LONG,
      DEFAULT_THROTTLE_LIMIT_LONG,
      { infer: true }
    );
  }
}
