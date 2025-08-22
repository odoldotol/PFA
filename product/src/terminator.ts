import { INestApplication } from "@nestjs/common";
import { KeepAliveInterceptor } from "src/app/interceptor";
import { Loggable } from "./logger";

class TerminatorStatic
  extends Loggable
{
  constructor() {
    super();
  }

  public add(app: INestApplication) {
    process.on('SIGINT', this.terminate.bind(this, app));
  }

  private async terminate(app: INestApplication) {
    app.get(KeepAliveInterceptor).disableKeepAlive();
    await app.close();
    this.logger.log('App closed');
    process.exit(0);
  }
}

export const Terminator = new TerminatorStatic();