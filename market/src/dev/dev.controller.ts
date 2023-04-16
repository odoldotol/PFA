import { Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { DevService } from './dev.service';
import { UpperCasePipe } from '@common/pipe/upperCasePipe';
import { ApiCommonResponse } from '@common/decorator/apiCommonResponse.decorator';
import { ApiOperation, ApiQuery, ApiTags, ApiQueryOptions } from '@nestjs/swagger';

@Controller('dev')
@ApiTags('Development')
@ApiCommonResponse()
export class DevController {

    constructor(
        private readonly devService: DevService) {}

    @Get('child/docs')
    @ApiOperation({ summary: 'Market Child API Docs', description: '' })
    getMarketDocs() {}

    @Post('asset/info')
    @HttpCode(200)
    @ApiOperation({ summary: 'Get All Assets Info', description: '' })
    getAllAssetsInfo() {
        return this.devService.getAllAssetsInfo();}

    @Post('status_price/info')
    @HttpCode(200)
    @ApiOperation({ summary: 'Get All Status_Price Info', description: '' })
    getAllStatusPrice() {
        return this.devService.getAllStatusPrice();}

    @Post('update/log')
    @HttpCode(200)
    @ApiOperation({ summary: 'Get Update Log', description: '최근 업데이트 로그를 요청합니다.' })
    @ApiQuery({ name: 'ISO_Code', required: false, description: '주어지지 않으면 모든 ISO_Code 에 대해 검색합니다.', type: 'string' })
    @ApiQuery({ name: 'limit', required: false, description: '검색할 로그의 수량. 기본 5개', type: 'number' })
    getUpdateLog(@Query('ISO_Code', UpperCasePipe) ISO_Code?: string, @Query('limit') limit?: number) {
        return this.devService.getUpdateLog(ISO_Code, limit);}

}
