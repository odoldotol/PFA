import {
  Controller,
  Get,
  UseGuards,
  VERSION_NEUTRAL,
  Version
} from '@nestjs/common';
import { HEALTH_PATH } from 'src/http';
import { GlobalThrottlerGuard } from 'src/common/guard';

@Controller()
@UseGuards(GlobalThrottlerGuard)
export class AppController {

  @Get(HEALTH_PATH)
  @Version(VERSION_NEUTRAL)
  health_check() {
    return { status: 'ok' };
  }

}
