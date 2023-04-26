import { Body, Controller, Get, HttpCode, Param, Post, UseGuards, VERSION_NEUTRAL, Version } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigExchangeDto } from './dto/configExchange.dto';
import { UpperCasePipe } from '@common/pipe/upperCasePipe';
import { TempKeyGuard } from '@common/guard/key.guard';
import { ApiCommonResponse } from '@common/decorator/apiCommonResponse.decorator';
import { Api_getPriceByExchange } from './decorator/api-getPriceByExchange.decorator';
import { Api_getPriceByTicker } from './decorator/api-getPriceByTicker.decorator';
import { Api_createConfigExchange } from './decorator/api-createConfigExchange.decorator';
import { ApiTags } from '@nestjs/swagger';

@Controller()
@ApiCommonResponse()
export class AppController {

    constructor(
        private readonly appService: AppService,) {}
    
    @Get('health')
    @Version(VERSION_NEUTRAL)
    @ApiTags('App')
    health_check() {
        return {status: 'ok'};}

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
    @UseGuards(TempKeyGuard)
    @Api_createConfigExchange() // TODO: detail
    createConfigExchange(@Body() body: ConfigExchangeDto) {
        return this.appService.createConfigExchange(body);}

}
