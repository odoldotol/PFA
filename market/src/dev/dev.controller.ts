import { Controller, Get, Query, Version } from '@nestjs/common';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { DevService } from './dev.service';
import { UpperCasePipe } from 'src/common/pipe/upperCasePipe';
import { ApiCommonResponse } from 'src/common/decorator/apiCommonResponse.decorator';
import {
  Api_getAllAssetsInfo,
  Api_getAllExchangeFromMarket,
  Api_getAllExchange,
  Api_getUpdateLog
} from './decorator';

@Controller('dev')
@ApiTags('Development')
@ApiCommonResponse()
export class DevController {

  constructor(
    private readonly devService: DevService
  ) {}

  @Get('asset/info')
  @Api_getAllAssetsInfo()
  getAllAssetsInfo() {
    return this.devService.getAllAssetsInfo();
  }

  @Version('1.1')
  @Get('exchange/market')
  @Api_getAllExchangeFromMarket()
  getAllExchangeFromMarket() {
    return this.devService.getAllExchangeFromMarket();
  }

  @Version('1.1')
  @Get('exchange/server')
  @Api_getAllExchange()
  getAllExchange() {
    return this.devService.getAllExchange();
  }

  @Get('status_price/info')
  @ApiExcludeEndpoint()
  getAllStatusPrice() {
    return this.getAllExchange();
  }

  @Get('update/log')
  @Api_getUpdateLog()
  getUpdateLog(@Query('ISO_Code', UpperCasePipe) ISO_Code?: string, @Query('limit') limit?: number) {
    return this.devService.getUpdateLog(ISO_Code, limit);
  }

}
