import { Body, Controller, Post, Put } from '@nestjs/common';
import { ManagerService } from './manager.service';

@Controller('manager')
export class ManagerController {

    constructor(private readonly managerService: ManagerService) {}

    @Post('yf')
    async createByTickerList(@Body() tickerList: string[]) {
        return this.managerService.createByTickerList(tickerList);
    }

    @Put('yf')
    async updateByTickerList(@Body() tickerList: string[]) {
        return this.managerService.updateByTickerList(tickerList);
    }

}
