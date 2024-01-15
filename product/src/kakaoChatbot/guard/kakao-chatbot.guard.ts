import { EnvironmentVariables } from 'src/common/interface/environmentVariables.interface';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvKey } from 'src/common/enum/envKey.emun';

@Injectable()
export class KakaoChatbotGuard implements CanActivate {

  private readonly KAKAO_CHATBOT_ID
  = this.configService.get(EnvKey.KAKAO_CHATBOT_ID, 'FAKE1234', { infer: true });

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>
  ) {}

  canActivate(context: ExecutionContext) {
    return context.switchToHttp().getRequest().body.bot?.id === this.KAKAO_CHATBOT_ID ?
    true :
    false;
  }
  
}
