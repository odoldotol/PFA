// Todo: 여기 있으면 안되는 코드. 다시 밖으로 빼.

import {
  INestApplication,
  Injectable,
  Logger
} from "@nestjs/common";
import { KeepAliveInterceptor } from "./interceptor";

@Injectable()
export class AppTerminator {

  private readonly logger = new Logger(AppTerminator.name);

  constructor(
    private readonly keepAliveInterceptor: KeepAliveInterceptor,
  ) {}

  public async terminate(app: INestApplication) {
    this.keepAliveInterceptor.disableKeepAlive();
    await app.close();
    this.logger.log('Server closed');
    process.exit(0);
  }
}
