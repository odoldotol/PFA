import {
  Controller,
  Get,
  UseGuards
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GlobalThrottlerGuard } from 'src/common/guard';
import { DevService } from './dev.service';
import { ApiCommonResponse } from 'src/common/decorator/apiCommonResponse.decorator'

@Controller('dev')
@UseGuards(GlobalThrottlerGuard)
@ApiTags('Development')
@ApiCommonResponse()
export class DevController {

  constructor(
    private readonly devService: DevService
  ) {}

  @Get('marketdate')
  @ApiOperation({ summary: 'Get All MarketDate', description: '캐시 기준 현재의 거래소별 최신화 상태를 알 수 있습니다.' })
  getAllMarketDate() {
    return this.devService.getAllMarketDate();
  }

  @Get('cache-key')
  @ApiOperation({ summary: 'Get All Cache Key', description: '' })
  getAllCacheKey() {
    return this.devService.getAllCacheKey();
  }

}
