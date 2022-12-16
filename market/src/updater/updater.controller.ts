import { Body, Controller, Param, ParseArrayPipe, Patch, Post, Query } from '@nestjs/common';
import { UpdaterService } from './updater.service';

@Controller('updater')
export class UpdaterController {

    constructor(private readonly updaterService: UpdaterService) {}
    
    // @Patch('yf/price/all')
    // async updatePriceAll(@Query('each') each: number) {
    //     return this.updaterService.updatePriceAll(each);
    // }

    @Patch('yf/price')
    async updatePriceByTickerArr(@Body(new ParseArrayPipe({items:String})) tickerArr: string[]) {
        return this.updaterService.updatePriceByTickerArr(tickerArr);
    }

    // @Post('yf/price')
    // async getPriceByTickerArr(@Body(new ParseArrayPipe({items:String})) tickerArr: string[]) {
    //     return this.updaterService.getPriceByTickerArr(tickerArr);
    // }

    @Patch('yf/price/filters')
    async updatePriceByFilters(@Body(new ParseArrayPipe({items:Object})) filterArr: object[]) {
        return this.updaterService.updatePriceByFilters(filterArr);
    }
}