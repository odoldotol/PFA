import {
  Injectable,
  CanActivate,
  ExecutionContext
} from '@nestjs/common';
import { KakaoChatbotConfigService } from 'src/config';

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
  constructor(
    private readonly kakaoChatbotConfigSrv: KakaoChatbotConfigService
  ) {}

  canActivate(context: ExecutionContext) {

    const botIdFromSkillPayload
    = context
    .switchToHttp()
    .getRequest()
    .body.bot?.id; //

    if (botIdFromSkillPayload === undefined) {
      return false;
    } else {
      return botIdFromSkillPayload === this.kakaoChatbotConfigSrv.getId();
    }
  }
}
