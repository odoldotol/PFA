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
