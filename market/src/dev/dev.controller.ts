import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DevService } from './dev.service';
import { UpperCasePipe } from 'src/common/pipe/upperCasePipe';
import { ApiCommonResponse } from 'src/common/decorator/apiCommonResponse.decorator';
import { Api_getAllAssetsInfo } from './decorator/api-getAllAssetsInfo.decorator';
import { Api_getAllStatusPrice } from './decorator/api-getAllStatusPrice.decorator';
import { Api_getUpdateLog } from './decorator/api-getUpdateLog.decorator';

@Controller('dev')
@ApiTags('Development')
@ApiCommonResponse()
export class DevController {

    constructor(
        private readonly devService: DevService) {}

    @Get('asset/info')
    @Api_getAllAssetsInfo()
    getAllAssetsInfo() {
        return this.devService.getAllAssetsInfo();}

    @Get('status_price/info')
    @Api_getAllStatusPrice()
    getAllStatusPrice() {
        return this.devService.getAllStatusPrice();}

    @Get('update/log')
    @Api_getUpdateLog()
    getUpdateLog(@Query('ISO_Code', UpperCasePipe) ISO_Code?: string, @Query('limit') limit?: number) {
        return this.devService.getUpdateLog(ISO_Code, limit);}

}
