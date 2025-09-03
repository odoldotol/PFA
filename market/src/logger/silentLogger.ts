import { LoggerService } from '@nestjs/common';

export class SilentLogger
  implements LoggerService
{
  log() {}
  error() {}
  warn() {}
  debug() {}
  verbose() {}
  setContext() {}
}
