import { Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { DevService } from './dev.service';
import { UpperCasePipe } from '../pipe/upperCasePipe';

@Controller('dev')
export class DevController {

    constructor(
        private readonly devService: DevService) {}

    @Get('getMarket/docs')
    getMarketDocs() {}

    @Post('asset/info')
    @HttpCode(200)
    getAllAssetsInfo() {
        return this.devService.getAllAssetsInfo();}

    @Post('status_price/info')
    @HttpCode(200)
    getAllStatusPrice() {
        return this.devService.getAllStatusPrice();}

    @Post('read_price_update_log')
    @HttpCode(200)
    getUpdateLog(@Query('ISO_Code', UpperCasePipe) ISO_Code?: string, @Query('limit') limit?: number) {
        return this.devService.getUpdateLog(ISO_Code, limit);}

}
