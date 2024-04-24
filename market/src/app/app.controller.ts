import {
  Controller,
  Get,
  VERSION_NEUTRAL,
  Version,
  UseGuards
} from '@nestjs/common';
import { HEALTH_URN } from 'src/common/const';
import { GlobalThrottlerGuard } from 'src/common/guard';

@Controller()
@UseGuards(GlobalThrottlerGuard)
export class AppController {

  @Get(HEALTH_URN)
  @Version(VERSION_NEUTRAL)
  health_check() {
    return { status: 'ok' };
  }

}
