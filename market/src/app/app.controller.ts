import {
  Controller,
  Get,
  VERSION_NEUTRAL,
  Version,
} from '@nestjs/common';
import { HEALTH_PATH } from 'src/http';

@Controller()
export class AppController {

  @Get(HEALTH_PATH)
  @Version(VERSION_NEUTRAL)
  health_check() {
    return { status: 'ok' };
  }

}
