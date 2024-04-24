/*
Todo: 내부 서버간 HTTP 보안

Market 서버의 업데이트 일정마다 HTTP 로 Product 서버가 업데이트 요정을 받는다는게 나쁘지만 양측에서 모두 효율적이긴함.
단, 이 요청을 안전하게 만들기위한 노력이 필요.

(gRPC?)
*/

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException
} from '@nestjs/common';
import { TempConfigService } from 'src/config';

@Injectable()
export class TempKeyGuard
  implements CanActivate
{

  constructor(
    private readonly tempConfigSrv: TempConfigService,
  ) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    if (request.body.key === this.tempConfigSrv.getKey()) {
      delete request.body.key;
      return true;
    } else throw new NotFoundException();
  };
}
