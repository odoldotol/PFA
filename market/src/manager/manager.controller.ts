import { Body, Controller, Delete, Get, HttpCode, ParseArrayPipe, Patch, Post, Put } from '@nestjs/common';
import { ManagerService } from './manager.service';
import { UpdaterService } from '../updater/updater.service';

@Controller('manager')
export class ManagerController {

    constructor(
        private readonly managerService: ManagerService,
        private readonly updaterService: UpdaterService,
        ) {}

    /**
     * ### DB 에 YF 식 심볼배열로 yf_info 생성해보고 그 작업의 결과를 알려주기
     */
    @Post('yf_info')
    @HttpCode(200)
    async createByTickerArr(@Body(new ParseArrayPipe({items:String})) tickerArr: string[]): Promise<object> {
        return this.managerService.createByTickerArr(tickerArr);
    }

    /**
     * ### status_price doc 모두 조회
     */
    @Get('status_price')
    async getAllStatusPrice() {
        return this.updaterService.getAllStatusPriceDoc();
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
