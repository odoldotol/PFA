import { Controller, Get, VERSION_NEUTRAL, Version } from '@nestjs/common';
import { ApiCommonResponse } from 'src/common/decorator/apiCommonResponse.decorator';

@Controller()
@ApiCommonResponse()
export class AppController {

  @Get('health')
  @Version(VERSION_NEUTRAL)
  health_check() {
    return { status: 'ok' };
  }

}
