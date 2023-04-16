import { Body, Controller, Delete, Get, HttpCode, Param, ParseArrayPipe, ParseEnumPipe, Patch, Post, Put, Query, UseGuards, Version } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigExchangeDto } from './dto/configExchange.dto';
import { UpperCasePipe } from '@common/pipe/upperCasePipe';
import { ApiCommonResponse } from '@common/decorator/apiCommonResponse.decorator';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ResponseGetPriceByTicker } from './response/getPriceByTicker.response';

@Controller()
@ApiCommonResponse()
export class AppController {

    constructor(
        private readonly appService: AppService,) {}

    // API Docs 에 https://www.iso20022.org/market-identifier-codes 사이트 링크 넣기
    @Post('price/exchange/:ISO_Code')
    @HttpCode(200)
    @ApiTags('App')
    @ApiOperation({
        summary: 'Get Price By Exchange ISO_Code',
        description: '거래소 ISO_Code로 해당 거래소의 Assets의 가격을 조회합니다.',
        externalDocs: { description: 'Exchange ISO_Code', url: 'https://www.iso20022.org/market-identifier-codes' }})
    @ApiParam({ name: 'ISO_Code', description: '조회할 거래소 ISO_Code', example: 'XNYS' })
    @ApiOkResponse({ description: '[Symbol, Price, Currency] 의 배열', schema: { example: [['AAPL', 160, 'USD'], ["MSFT", 280, "USD"]] } })
    getPriceByExchange(@Param('ISO_Code', UpperCasePipe) ISO_Code: string) {
        return this.appService.getPriceByExchange(ISO_Code);}

    @Post('price/ticker/:ticker')
    @HttpCode(200)
    @ApiTags('App')
    @ApiOperation({ summary: 'Get Price By ticker', description: 'ticker로 해당 Asset의 가격을 조회합니다.' })
    @ApiParam({ name: 'ticker', description: '조회할 항목 ticker', example: 'AAPL' })
    @ApiOkResponse({ description: 'Price', type: ResponseGetPriceByTicker })
    getPriceByTicker(@Param('ticker', UpperCasePipe) ticker: string) {
        return this.appService.getPriceByTicker(ticker);}

    @Post('config/exchange')
    @ApiTags('Config')
    @ApiOperation({ summary: 'Create Config Exchange', description: 'Exchange 설정 데이터를 생성합니다.' })
    createConfigExchange(@Body() body: ConfigExchangeDto) {
        return this.appService.createConfigExchange(body);}

}
