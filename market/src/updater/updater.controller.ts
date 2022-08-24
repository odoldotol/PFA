import { Body, Controller, Param, Patch, Post, Query } from '@nestjs/common';
import { UpdaterService } from './updater.service';

type Option = 'timeZone' | 'exchange' | 'city';

@Controller('updater')
export class UpdaterController {

    constructor(private readonly updaterService: UpdaterService) {}
    
    // @Patch('yf/price/all')
    // async updatePriceAll(@Query('each') each: number) {
    //     return this.updaterService.updatePriceAll(each);
    // }

    @Patch('yf/price')
    async updatePriceByTickerArr(@Body() tickerArr: string[]) {
        return this.updaterService.updatePriceByTickerArr(tickerArr);
    }

    @Post('yf/price')
    async getPriceByTickerList(@Body() tickerArr: string[]) {
        return this.updaterService.getPriceByTickerArr(tickerArr);
    }

    @Patch('yf/price/:by')
    async updatePriceByOption(@Param('by') option: Option, @Body() optionArr: string[]) {
        return this.updaterService.updatePriceByOption(option, optionArr);
    }
}