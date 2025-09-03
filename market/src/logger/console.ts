import {
  Injectable,
  ConsoleLogger as NestConsoleLogger
} from '@nestjs/common';

@Injectable()
export class ConsoleLogger
  extends NestConsoleLogger
{
  constructor(context = "Unknown") {
    super(context);
  }

  override getTimestamp(): string {
    return Date.now().toString();
  }
}
