import { Controller, Get, VERSION_NEUTRAL, Version } from '@nestjs/common';
import { HEALTH_URI } from 'src/common/const';
import { ApiCommonResponse } from 'src/common/decorator/apiCommonResponse.decorator';

@Controller()
@ApiCommonResponse()
export class AppController {

  @Get(HEALTH_URI)
  @Version(VERSION_NEUTRAL)
  health_check() {
    return { status: 'ok' };
  }

}
