import { Controller, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiCommonResponse } from '@common/decorator/apiCommonResponse.decorator';
import { DevService } from '@dev.service';
import { UpperCasePipe } from '@common/pipe/upperCasePipe';
import { Api_getPrice } from './decorator/api-getPrice.decorator';

@Controller('dev')
@ApiTags('Development')
@ApiCommonResponse()
export class DevController {

    constructor(
        private readonly devService: DevService) {}

    @Post('price/:ticker')
    @HttpCode(200)
    @Api_getPrice()
    getPrice(@Param('ticker', UpperCasePipe) ticker: string, @Query('id') id?: string) {
        return this.devService.getPrice(ticker, id);}

    @Get('marketdate')
    @ApiOperation({ summary: 'Get All MarketDate', description: '캐시 기준 현재의 거래소별 최신화 상태를 알 수 있습니다.' })
    getAllMarketDate() {
        return this.devService.getAllMarketDate();}

    @Get('cache-key')
    @ApiOperation({ summary: 'Get All Cache Key', description: '' })
    getAllCacheKey() {
        return this.devService.getAllCacheKey();}

}
