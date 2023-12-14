// 임시. 사라질 예정.
// AWS Security Group 에서 관리할 영역이지만 임시로 전체 허용하려고 만든 Guard.

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TempKeyGuard implements CanActivate {

  private readonly TEMP_KEY = this.configService.get('TEMP_KEY', 'TEMP_KEY');

  constructor(
      private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    if (request.body.key === this.TEMP_KEY) {
      delete request.body.key;
      return true;
    } else return false;
  };

}