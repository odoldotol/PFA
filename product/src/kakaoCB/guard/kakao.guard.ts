import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

@Injectable()
export class KakaoGuard implements CanActivate {

  private readonly KAKAO_CHATBOT_ID: string = this.configService.get('KAKAO_CHATBOT_ID');

  constructor(
      private readonly configService: ConfigService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    if (request.body.bot.id === this.KAKAO_CHATBOT_ID) return true;
    else return false;
  }
}