import { Body, Controller, Delete, ParseArrayPipe, Patch, Post, Put } from '@nestjs/common';
import { ManagerService } from './manager.service';

@Controller('manager')
export class ManagerController {

    constructor(private readonly managerService: ManagerService) {}

    @Post('yf')
    async createByTickerArr(@Body(new ParseArrayPipe({items:String})) tickerArr: string[]) {
        return this.managerService.createByTickerArr(tickerArr);
    }

    @Put('yf')
    async updateByTickerArr(@Body(new ParseArrayPipe({items:String})) tickerArr: string[]) {
        return this.managerService.updateByTickerArr(tickerArr);
    }

    @Delete('yf')
    async deleteByTickerArr(@Body(new ParseArrayPipe({items:String})) tickerArr: string[]) {
        return this.managerService.deleteByTickerArr(tickerArr);
    }

    @Patch('yf/modify')
    async actionAboutPatch() {}

    @Put('yf/modify')
    async actionAboutPut() {}
}
