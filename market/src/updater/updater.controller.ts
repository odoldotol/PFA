import { Body, Controller, Post, Put, Query } from '@nestjs/common';
import { UpdaterService } from './updater.service';

@Controller('updater')
export class UpdaterController {

    constructor(private readonly updaterService: UpdaterService) {}
    
    @Put('yf/price/all')
    async updatePriceAll(@Query('each') each: number) {
        return this.updaterService.updatePriceAll(each);
    }

    @Put('yf/price')
    async updatePriceByTickerList(@Body() tickerList: string[]) {
        return this.updaterService.updatePriceByTickerList(tickerList);
    }

    @Post('yf/price')
    async getPriceByTickerList(@Body() tickerList: string[]) {
        return this.updaterService.getPriceByTickerList(tickerList);
    }
}
