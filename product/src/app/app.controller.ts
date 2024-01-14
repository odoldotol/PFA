import { Controller, Get, VERSION_NEUTRAL, Version } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller()
export class AppController {

  @Get('health')
  @Version(VERSION_NEUTRAL)
  @ApiTags('App')
  health_check() {
    return { status: 'ok' };
  }

}
