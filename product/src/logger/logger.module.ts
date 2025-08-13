import {
  Global,
  Module
} from '@nestjs/common';
import { ConsoleLogger } from './console';

@Global()
@Module({
  providers: [ConsoleLogger],
  exports: [ConsoleLogger],
})
export class LoggerModule {}
