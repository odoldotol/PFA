import { Logger } from '@nestjs/common';

export class Loggable {

  protected readonly logger;

  constructor(context?: string) {
    this.logger = new Logger(context ?? this.constructor.name);
  }
}
