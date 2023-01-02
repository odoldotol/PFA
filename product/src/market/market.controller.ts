import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MarketService } from './market.service';
import { RegularUpdateForPriceBodyDto } from './dto/regularUpdateForPriceBody.dto';

@Controller('market')
export class MarketController {

    constructor(
        private readonly marketService: MarketService
    ) {}

    /**
     * ### DEV
     */
    @Get('dev/:ticker')
    async devGetPrice(@Param('ticker') ticker: string) {
        return this.marketService.getPriceByTicker(ticker);
    }

    /**
     * ### 
     */
    @Post('updater/:ISO_Code')
    async regularUpdaterForPrice(@Param('ISO_Code') ISO_Code: string, @Body() body: RegularUpdateForPriceBodyDto) {
        return this.marketService.regularUpdaterForPrice(ISO_Code, body);
    }

}
