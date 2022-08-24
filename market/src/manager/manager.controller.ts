import { Body, Controller, Delete, Patch, Post, Put } from '@nestjs/common';
import { ManagerService } from './manager.service';

@Controller('manager')
export class ManagerController {

    constructor(private readonly managerService: ManagerService) {}

    @Post('yf')
    async createByTickerArr(@Body() tickerArr: string[]) {
        return this.managerService.createByTickerArr(tickerArr);
    }

    @Put('yf')
    async updateByTickerArr(@Body() tickerArr: string[]) {
        return this.managerService.updateByTickerArr(tickerArr);
    }

    @Delete('yf')
    async deleteByTickerArr(@Body() tickerArr: string[]) {
        return this.managerService.deleteByTickerArr(tickerArr);
    }

    @Patch('yf/modify')
    async actionAboutPatch() {}

    @Put('yf/modify')
    async actionAboutPut() {}
}
