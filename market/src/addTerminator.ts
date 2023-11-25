import { INestApplication, Logger } from "@nestjs/common";
import { KeepAliveInterceptor } from "src/app/interceptor";

export default (app: INestApplication) => {
  process.on('SIGINT', async () => {
    app.get(KeepAliveInterceptor).disableKeepAlive();
    await app.close();
    new Logger("AppTerminator").log('App closed');
    process.exit(0);
  });
};