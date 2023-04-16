import { Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { DevService } from './dev.service';
import { UpperCasePipe } from '@common/pipe/upperCasePipe';
import { ApiCommonResponse } from '@common/decorator/apiCommonResponse.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
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
    @HttpCode(200)
    @Api_getAllAssetsInfo()
    getAllAssetsInfo() {
        return this.devService.getAllAssetsInfo();}

    @Get('status_price/info')
    @HttpCode(200)
    @Api_getAllStatusPrice()
    getAllStatusPrice() {
        return this.devService.getAllStatusPrice();}

    @Get('update/log')
    @HttpCode(200)
    @Api_getUpdateLog()
    getUpdateLog(@Query('ISO_Code', UpperCasePipe) ISO_Code?: string, @Query('limit') limit?: number) {
        return this.devService.getUpdateLog(ISO_Code, limit);}

    @Get('child/docs')
    @ApiOperation({ summary: 'Market Child API Docs', deprecated: true })
    getChildApiDocs() {
        return this.devService.getChildApiDocs();}

    @Get('child/openapi.json')
    @ApiOperation({ summary: 'Market Child API Openapi.json', deprecated: true })
    getChildApiOpenapiJson() {
        return this.devService.getChildApiOpenapiJson();}

}