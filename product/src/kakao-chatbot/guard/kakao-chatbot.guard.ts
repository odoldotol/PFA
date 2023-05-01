import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

@Injectable()
export class KakaoChatbotGuard implements CanActivate {

  private readonly KAKAO_CHATBOT_ID = this.configService.get<string>('KAKAO_CHATBOT_ID'); //

  constructor(
      private readonly configService: ConfigService,) {}

  canActivate = (context: ExecutionContext) =>
    context.switchToHttp().getRequest().body.bot?.id === this.KAKAO_CHATBOT_ID ? true : false;
  
}