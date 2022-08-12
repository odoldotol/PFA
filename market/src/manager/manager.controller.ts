import { Body, Controller, Delete, Patch, Post, Put } from '@nestjs/common';
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

    @Delete('yf')
    async deleteByTickerList(@Body() tickerList: string[]) {
        return this.managerService.deleteByTickerList(tickerList);
    }

    @Patch('yf/modify')
    async actionAboutPatch() {}

    @Put('yf/modify')
    async actionAboutPut() {}
}
