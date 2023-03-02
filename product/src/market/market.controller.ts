import { Body, Controller, Get, HttpCode, Param, Post, Query, UnauthorizedException } from '@nestjs/common';
import { MarketService } from './market.service';
import { RegularUpdateForPriceBodyDto } from './dto/regularUpdateForPriceBody.dto';
import { ConfigService } from '@nestjs/config';
import { UpperCasePipe } from './pipe/upperCasePipe';

@Controller('market')
export class MarketController {

    private readonly TEMP_KEY = this.configService.get('TEMP_KEY');

    constructor(
        private readonly configService: ConfigService,
        private readonly marketService: MarketService
    ) {}

    /**
     * ### 마켓서버로부터의 레귤러업데이트
     */
    @Post('updater/:ISO_Code')
    async regularUpdaterForPrice(@Param('ISO_Code', UpperCasePipe) ISO_Code: string, @Body() body: RegularUpdateForPriceBodyDto) {
        if (body.key !== this.TEMP_KEY) {
            throw new UnauthorizedException();
        };
        return await this.marketService.regularUpdaterForPrice(ISO_Code, body);
    }




    /**
     * ### 가격조회
     */
    @Get('dev')
    async devGetPrice(@Query('ticker', UpperCasePipe) ticker: string, @Query('id') id?: string) {
        return await this.marketService.getPriceByTicker(ticker, id);
    }

    /**
     * ### 가격의 상태를 조회
     * - cache: 캐시의 상태
     * - market: 마켓서버의 상태
     */
    @Get('dev/price_status/:where')
    async devGetMarketPriceStatus(@Param('where') where: "cache" | "market") {
        return await this.marketService.getMarketPriceStatus(where);
    }

    /**
     * ### 서비스하는 assets 조회
     * - cache: 캐시에서
     * - market: 마켓서버에서
     */
    @Get('dev/assets/:where')
    async devGetAssets(@Param('where') where: "cache" | "market") {
        return await this.marketService.getAssets(where);
    }




    /**
     * ### POST MarketServer/manager/yf_info
     */
    @Post('market_server/create_by_ticker_arr')
    @HttpCode(200)
    async requestCreateByTickerArrToMarket(@Body() body: {key: string, tickerArr: string[]}): Promise<object> {
        if (body.key !== this.TEMP_KEY) {
            throw new UnauthorizedException();
        };
        return await this.marketService.requestCreateByTickerArrToMarket(body.tickerArr);
    }

    /**
     * ### POST MarketServer/manager/config_exchange
     */
    @Post('market_server/create_config_exchange')
    async requestCreateConfigExchangeToMarket(@Body() body: {key: string, configExchange: object}): Promise<object> {
        if (body.key !== this.TEMP_KEY) {
            throw new UnauthorizedException();
        };
        return await this.marketService.requestCreateConfigExchangeToMarket(body.configExchange);
    }

    /**
     * ### POST MarketServer/manager/updater_log
     */
    @Get('market_server/read_price_update_log')
    async requestReadPriceUpdateLogToMarket(@Body() body: {key: string, ISO_Code?: string, limit?: number}) {
        if (body.key !== this.TEMP_KEY) {
            throw new UnauthorizedException();
        };
        return await this.marketService.requestReadPriceUpdateLogToMarket(body);
    }

}
