import { Body, Controller, Delete, HttpCode, ParseArrayPipe, Patch, Post, Put } from '@nestjs/common';
import { ManagerService } from './manager.service';

@Controller('manager')
export class ManagerController {

    constructor(private readonly managerService: ManagerService) {}

    /**
     * ### DB 에 신규 자산(들) 생성해보고 그 작업의 결과를 알려주기
     */
    @Post('yf')
    @HttpCode(200)
    async createByTickerArr(@Body(new ParseArrayPipe({items:String})) tickerArr: string[]): Promise<object> {
        return this.managerService.createByTickerArr(tickerArr);
    }

    // @Put('yf')
    // async updateByTickerArr(@Body(new ParseArrayPipe({items:String})) tickerArr: string[]) {
    //     return this.managerService.updateByTickerArr(tickerArr);
    // }

    // @Delete('yf')
    // async deleteByTickerArr(@Body(new ParseArrayPipe({items:String})) tickerArr: string[]) {
    //     return this.managerService.deleteByTickerArr(tickerArr);
    // }

    // @Patch('yf/modify')
    // async actionAboutPatch() {}

    // @Put('yf/modify')
    // async actionAboutPut() {}
}
