import { Body, Controller, Delete, Get, HttpCode, Param, ParseArrayPipe, ParseEnumPipe, Patch, Post, Put, Query, UseGuards, Version } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigExchangeDto } from './dto/configExchange.dto';
import { UpperCasePipe } from '@common/pipe/upperCasePipe';
import { ApiCommonResponse } from '@common/decorator/apiCommonResponse.decorator';
import { Api_getPriceByExchange } from './decorator/api-getPriceByExchange.decorator';
import { Api_getPriceByTicker } from './decorator/api-getPriceByTicker.decorator';
import { Api_createConfigExchange } from './decorator/api-createConfigExchange.decorator';

@Controller()
@ApiCommonResponse()
export class AppController {

    constructor(
        private readonly appService: AppService,) {}

    // API Docs 에 https://www.iso20022.org/market-identifier-codes 사이트 링크 넣기
    @Post('price/exchange/:ISO_Code')
    @HttpCode(200)
    @Api_getPriceByExchange()
    getPriceByExchange(@Param('ISO_Code', UpperCasePipe) ISO_Code: string) {
        return this.appService.getPriceByExchange(ISO_Code);}

    @Post('price/ticker/:ticker')
    @HttpCode(200)
    @Api_getPriceByTicker()
    getPriceByTicker(@Param('ticker', UpperCasePipe) ticker: string) {
        return this.appService.getPriceByTicker(ticker);}

    @Post('config/exchange')
    @Api_createConfigExchange() // TODO: detail
    createConfigExchange(@Body() body: ConfigExchangeDto) {
        return this.appService.createConfigExchange(body);}

}
