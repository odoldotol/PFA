import { EnvironmentVariables } from 'src/common/interface/environmentVariables.interface';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { EnvKey } from '@common/enum/envKey.emun';

@Injectable()
export class KakaoChatbotGuard implements CanActivate {

  private readonly KAKAO_CHATBOT_ID = this.configService.get(EnvKey.KakaoChatbotID, 'FAKE1234', { infer: true });

  constructor(
      private readonly configService: ConfigService<EnvironmentVariables>) {}

  canActivate = (context: ExecutionContext) =>
    context.switchToHttp().getRequest().body.bot?.id === this.KAKAO_CHATBOT_ID ? true : false;
  
}