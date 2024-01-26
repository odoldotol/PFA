import { EnvironmentVariables } from 'src/common/interface/environmentVariables.interface';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvKey } from 'src/common/enum/envKey.emun';

@Injectable()
export class KakaoChatbotGuard implements CanActivate {

  private readonly KAKAO_CHATBOT_ID = this.configService.get(
    EnvKey.KAKAO_CHATBOT_ID,
    { infer: true }
  );

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>
  ) {
    const isProduction = this.configService.get(
      EnvKey.DOCKER_ENV,
      { infer: true }
    ) === 'production';
    
    if (
      isProduction &&
      this.KAKAO_CHATBOT_ID === undefined
    ) {
      throw new Error('KAKAO_CHATBOT_ID is not defined!');
    }
  }

  canActivate(context: ExecutionContext) {
    const botIdFromSkillPayload = context
    .switchToHttp()
    .getRequest()
    .body.bot?.id;

    if (botIdFromSkillPayload === undefined) {
      return false;
    } else {
      return botIdFromSkillPayload === this.getKakaoChatbotId();
    }
  }

  private getKakaoChatbotId(): string | undefined {
    return this.KAKAO_CHATBOT_ID;
  }
  
}
