import { EnvironmentVariables } from 'src/common/interface/environmentVariables.interface';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvKey } from 'src/common/enum/envKey.emun';

/**
 * #### 임시로 body.bot.id 을 이용해 권한 검사.
 * @todo 카카오 챗봇 서버와 토큰 인증. (가능하면 카카오싱크 플러그인 이용)
 *
 * P.S. guard 가 pipe 보다 먼저 실행된다는 것만으로, 이미 guard 가 body 에 접근하는것 자채가 좋지않음.
 */
@Injectable()
export class KakaoChatbotGuard
  implements CanActivate
{
  private readonly KAKAO_CHATBOT_ID: string;

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>
  ) {
    // Todo: ConfigModule -----------------------------------------
    const isProduction = this.configService.get(
      EnvKey.DOCKER_ENV,
      { infer: true }
    ) === 'production';

    const id = this.configService.get(
      EnvKey.KAKAO_CHATBOT_ID,
      { infer: true }
    );

    if (
      isProduction &&
      id === undefined
    ) {
      throw new Error('KAKAO_CHATBOT_ID is not defined!');
    }

    this.KAKAO_CHATBOT_ID = id || 'KAKAO_CHATBOT_ID';
    // ------------------------------------------------------------
  }

  canActivate(context: ExecutionContext) {

    const botIdFromSkillPayload
    = context
    .switchToHttp()
    .getRequest()
    .body.bot?.id; //

    if (botIdFromSkillPayload === undefined) {
      return false;
    } else {
      return botIdFromSkillPayload === this.KAKAO_CHATBOT_ID;
    }
  }
}
