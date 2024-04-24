import {
  Controller,
  Get,
  Query,
  UseGuards,
  Version
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GlobalThrottlerGuard } from 'src/common/guard';
import { DevService } from './dev.service';
import { ExchangeIsoCode } from 'src/common/interface';
import { UpperCasePipe } from 'src/common/pipe';
import { ApiCommonResponse } from 'src/common/decorator/apiCommonResponse.decorator';
import {
  Api_getAllExchangesFromMarket,
  Api_getUpdateLog
} from './decorator';

@Controller('dev')
@UseGuards(GlobalThrottlerGuard)
@ApiTags('Development')
@ApiCommonResponse()
export class DevController {

  constructor(
    private readonly devService: DevService
  ) {}

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
