import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

@Injectable()
export class KeyGuard implements CanActivate {

  private readonly TEMP_KEY = this.configService.get('TEMP_KEY');

  constructor(
      private readonly configService: ConfigService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    if (request.body.key === this.TEMP_KEY) {
      delete request.body.key;
      return true;
    };
    return false;
  }
}