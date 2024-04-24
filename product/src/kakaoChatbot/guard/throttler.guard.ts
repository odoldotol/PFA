import { Request } from "express";
import { GlobalThrottlerGuard } from "src/common/guard";

/**
 * ### 유저별 쓰로틀링
 * #### 임시로 body 를 이용해 검사.
 * @todo 카카오 챗봇 서버와 토큰 인증. (가능하면 카카오싱크 플러그인 이용)
 *
 * guard 가 pipe 보다 먼저 실행된다는 것만으로, 이미 guard 가 body 에 접근하는것 자채가 좋지않음.
 */
export class KakaoChatbotThrottlerGuard
  extends GlobalThrottlerGuard
{
  protected override async getTracker(
    req: Request
  ): Promise<string> {
    let tracker;
    if (typeof (tracker = req.body.userRequest?.user?.properties?.botUserKey) === "string") {
      return tracker;
    } else {
      return super.getTracker(req);
    }
  }
}
