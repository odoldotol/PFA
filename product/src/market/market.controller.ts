import { Body, Controller, Get, HttpCode, Param, Post, Query, UnauthorizedException, UseGuards } from '@nestjs/common';
import { MarketService } from './market.service';
import { RegularUpdateForPriceBodyDto } from './dto/regularUpdateForPriceBody.dto';
import { UpperCasePipe } from './pipe/upperCasePipe';
import { KeyGuard } from './guard/key.guard';
import { MarketDateParser } from './pipe/marketDateParser';

@Controller('market')
export class MarketController {

    constructor(
        private readonly marketService: MarketService
    ) {}

    /**
     * ### 마켓서버로부터의 레귤러업데이트
     */
    @Post('updater')
    @UseGuards(KeyGuard)
    regularUpdaterForPrice(@Body(UpperCasePipe, MarketDateParser) body: RegularUpdateForPriceBodyDto) {
        return this.marketService.regularUpdaterForPrice([ body.ISO_Code, body.marketDateClass ], body.priceArrs);
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

    /**
     * ### [임시] POST MarketServer/manager/read_price_update_log
     */
    @Get('market_server/read_price_update_log')
    requestReadPriceUpdateLogToMarket(@Query('ISO_Code', UpperCasePipe) ISO_Code?: string, @Query('limit') limit?: number) {
        return this.marketService.requestReadPriceUpdateLogToMarket({ ISO_Code, limit });
    }

}
