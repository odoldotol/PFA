import { Controller, Get, Query, Version } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DevService } from './dev.service';
import { ExchangeIsoCode } from 'src/common/interface';
import { UpperCasePipe } from 'src/common/pipe/upperCasePipe';
import { ApiCommonResponse } from 'src/common/decorator/apiCommonResponse.decorator';
import {
  Api_getAllAssetsInfo,
  Api_getAllExchangesFromMarket,
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
  @Api_getAllExchangesFromMarket()
  getAllExchangesFromMarket() {
    return this.devService.getAllExchangesFromMarket();
  }

  @Get('update/log')
  @Api_getUpdateLog()
  getUpdateLog(
    @Query('ISO_Code', UpperCasePipe) isoCode?: ExchangeIsoCode,
    @Query('limit') limit?: number
  ) {
    return this.devService.getUpdateLog(isoCode, limit);
  }

}
