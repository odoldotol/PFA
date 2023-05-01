import { EnvironmentVariables } from 'src/common/interface/environmentVariables.interface';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvKey } from 'src/common/enum/envKey.emun';

@Injectable()
export class TempKeyGuard implements CanActivate {

  private readonly TEMP_KEY = this.configService.get(EnvKey.TempKey, 'TEMP_KEY', { infer: true });

  constructor(
      private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  canActivate = (context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    if (request.body.key === this.TEMP_KEY) {
      delete request.body.key;
      return true;
    } else return false;};

}