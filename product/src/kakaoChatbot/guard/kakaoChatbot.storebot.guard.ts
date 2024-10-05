import {
  Injectable,
  CanActivate,
  ExecutionContext
} from '@nestjs/common';
import { KakaoChatbotConfigService } from 'src/config';

/**
 * #### 임시로 body 를 이용해 검사.
 * @todo 카카오 챗봇 서버와 토큰 인증. (가능하면 카카오싱크 플러그인 이용)
 *
 * guard 가 pipe 보다 먼저 실행된다는 것만으로, 이미 guard 가 body 에 접근하는것 자채가 좋지않음.
 */
@Injectable()
export class KakaoChatbotStorebotGuard
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
      return botIdFromSkillPayload === this.kakaoChatbotConfigSrv.getIdStorebot();
    }
  }
}
