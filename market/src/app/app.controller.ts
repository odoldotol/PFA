import {
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  VERSION_NEUTRAL,
  Version
} from '@nestjs/common';
import { AppService } from './app.service';
import { UpperCasePipe } from 'src/common/pipe/upperCasePipe';
import { ApiCommonResponse } from 'src/common/decorator/apiCommonResponse.decorator';
import { Api_getPriceByExchange } from './decorator/api-getPriceByExchange.decorator';
import { Api_getPriceByTicker } from './decorator/api-getPriceByTicker.decorator';
import { ApiTags } from '@nestjs/swagger';

@Controller()
@ApiCommonResponse()
export class AppController {

  constructor(
    private readonly appService: AppService
  ) {}

  @Get('health')
  @Version(VERSION_NEUTRAL)
  @ApiTags('App')
  health_check() {
    return { status: 'ok' };
  }

  @Post('price/exchange/:ISO_Code')
  @HttpCode(200)
  @Api_getPriceByExchange()
  getPriceByExchange(@Param('ISO_Code', UpperCasePipe) ISO_Code: string) {
    return this.appService.getPriceByExchange(ISO_Code);
  }

  @Post('price/ticker/:ticker')
  @HttpCode(200)
  @Api_getPriceByTicker()
  getPriceByTicker(@Param('ticker', UpperCasePipe) ticker: string) {
    return this.appService.getPriceByTicker(ticker);
  }

}
