import { Body, Controller, Get, HttpCode, Param, Post, Query, UnauthorizedException, UseGuards } from '@nestjs/common';
import { MarketService } from './market.service';
import { RegularUpdateForPriceBodyDto } from './dto/regularUpdateForPriceBody.dto';
import { UpperCasePipe } from './pipe/upperCasePipe';
import { KeyGuard } from './guard/key.guard';

@Controller('market')
export class MarketController {

    constructor(
        private readonly marketService: MarketService
    ) {}

    /**
     * ### 마켓서버로부터의 레귤러업데이트
     */
    @Post('updater/:ISO_Code')
    @UseGuards(KeyGuard)
    regularUpdaterForPrice(@Param('ISO_Code', UpperCasePipe) ISO_Code: string, @Body() body: RegularUpdateForPriceBodyDto) {
        return this.marketService.regularUpdaterForPrice(ISO_Code, body);
    }




    /**
     * ### 가격조회
     */
    @Post('dev')
    devGetPrice(@Body(UpperCasePipe) body: {ticker: string, id?: string}) {
        return this.marketService.getPriceByTicker(body.ticker, body.id);
    }

    /**
     * ### 가격의 상태를 조회
     * - cache: 캐시의 상태
     * - market: 마켓서버의 상태
     */
    @Get('dev/price_status/:where')
    devGetMarketPriceStatus(@Param('where') where: "cache" | "market") {
        return this.marketService.getMarketPriceStatus(where);
    }

    /**
     * ### 서비스하는 assets 조회
     * - cache: 캐시에서
     * - market: 마켓서버에서
     */
    @Get('dev/assets/:where')
    devGetAssets(@Param('where') where: "cache" | "market") {
        return this.marketService.getAssets(where);
    }




    // /**
    //  * ### POST MarketServer/manager/yf_info
    //  */
    // @Post('market_server/create_by_ticker_arr')
    // @UseGuards(AdminGuard)
    // @HttpCode(200)
    // requestCreateByTickerArrToMarket(@Body() body: {key: string, tickerArr: string[]}): Promise<object> {
    //     return this.marketService.requestCreateByTickerArrToMarket(body.tickerArr);
    // }

    // /**
    //  * ### POST MarketServer/manager/config_exchange
    //  */
    // @Post('market_server/create_config_exchange')
    // @UseGuards(AdminGuard)
    // requestCreateConfigExchangeToMarket(@Body() body: {key: string, configExchange: object}): Promise<object> {
    //     return this.marketService.requestCreateConfigExchangeToMarket(body.configExchange);
    // }

    /**
     * ### GET MarketServer/manager/updater_log
     */
    @Get('market_server/read_price_update_log')
    requestReadPriceUpdateLogToMarket(@Query('ISO_Code', UpperCasePipe) ISO_Code?: string, @Query('limit') limit?: number) {
        return this.marketService.requestReadPriceUpdateLogToMarket({ ISO_Code, limit });
    }

}
