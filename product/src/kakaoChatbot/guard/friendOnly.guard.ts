import {
  Injectable,
  CanActivate,
  ExecutionContext
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { NotFriendException } from '../exception';

/**
 * #### body 를 이용해 검사.
 * guard 가 pipe 보다 먼저 실행된다는 것만으로도, guard 에서 body 를 이용하는것이 바람직해보이지는 않는다.
 */
@Injectable()
export class FriendOnlyGuard
  implements CanActivate
{
  constructor(
    private readonly authSrv: AuthService
  ) {}

  canActivate(
    context: ExecutionContext
  ): boolean {
    const skillPayload
    = context
    .switchToHttp()
    .getRequest()
    .body;

    if (this.authSrv.isFriend(skillPayload)) {
      return true;
    } else {
      throw new NotFriendException();
    }
  }
}
