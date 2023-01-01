import { Controller, Get, Param } from '@nestjs/common';
import { MarketService } from './market.service';

@Controller('market')
export class MarketController {

    constructor(
        private readonly marketService: MarketService
    ) {}

    @Get('dev/:ticker')
    async devGetPrice(@Param('ticker') ticker: string) {
        return this.marketService.getPriceByTicker(ticker);
    }
}
