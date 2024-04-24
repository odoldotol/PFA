import {
  Module
} from "@nestjs/common";
import {
  ThrottlerModule as NestThrottlerModule,
} from '@nestjs/throttler';
import { ThrottlerConfigService } from "./throttlerConfig.service";

@Module({
  imports: [
    NestThrottlerModule.forRootAsync({
      useClass: ThrottlerConfigService,
    }),
  ],
})
export class ThrottlerModule {}
