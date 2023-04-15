import { Body, Controller, Delete, Get, HttpCode, Param, ParseArrayPipe, ParseEnumPipe, Patch, Post, Put, Query, UseGuards, Version } from '@nestjs/common';
import { AppService } from './app.service';
import { UpdaterService } from './updater/updater.service';
import { ConfigExchangeDto } from './dto/configExchange.dto';
import { CreateAssetsDto } from './dto/createAssets.dto';
import { KeyGuard } from './guard/key.guard';
import { UpperCasePipe } from './pipe/upperCasePipe';
import { ApiCommonResponse } from './decorator/apiCommonResponse.decorator';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller()
// @UseGuards(KeyGuard) // TODO: Guard?
@ApiCommonResponse()
export class AppController {

    constructor(
        private readonly appService: AppService,
        private readonly updaterService: UpdaterService) {}

    @Post('asset')
    @HttpCode(200)
    @ApiTags('Asset')
    @ApiBody({ type: [String], description: 'ticker 배열', required: true, examples: { 
        '1': { summary: "기본", description: "ticker로 이루어진 배열입니다.",  value: ['aapl', 'msft']},
        '2': { summary: "대소문자", description: "대소문자를 구별하지 않으며 중복된 티커는 무시됩니다. 위 예제는 [ 'AAPL' ] 과 결과적으로 동일합니다.",  value: ['aapl', 'AAPL', 'aApL', 'Aapl']},
        '3': { summary: "국가코드", description: "미국 이외 국가 거래소의 티커는 예시와 같이 국가코드를 포함해야합니다.", value: ['005930.KS', 'ADS.DE']},}})
    @ApiOperation({ summary: 'Create Assets', description: 'ticker배열로 Assets를 생성합니다.' })
    createAssets (@Body(UpperCasePipe, new ParseArrayPipe({ items: String })) tickerArr: string[]) {
        return this.updaterService.createAssetByTickerArr(tickerArr);} // Refac: addAsset

    @Post('price')
    @HttpCode(200)
    @ApiTags('Asset')
    @ApiOperation({ summary: 'Get Price', description: 'ticker 또는 ISO_Code로 해당 Assets의 가격을 조회합니다.' })
    getPrice(@Body(UpperCasePipe) body: {ISO_Code?: string, ticker?: string}) {
        return this.appService.getPrice(body);}

    @Post('config/exchange')
    @ApiTags('Config')
    @ApiOperation({ summary: 'Create Config Exchange', description: 'Exchange 설정 데이터를 생성합니다.' })
    createConfigExchange(@Body() body: ConfigExchangeDto) {
        return this.appService.createConfigExchange(body);}

    @Post('updater/initiate')
    @HttpCode(200)
    @ApiTags('Updater')
    @ApiOperation({ summary: 'Re-Launch All Updater', description: '모든 Updater를 재실행합니다.' })
    Initiator() {
        return this.updaterService.initiator();}

    // TODO: 제거하고 진짜 제너럴 이니시에이터 실행하는 api 열기
    @Post('updater/test_generalInitiate/:ISO_Code')
    @HttpCode(200)
    @ApiTags('Updater')
    @ApiOperation({ summary: 'Re-Launch Updater<진>', description: '해당 ISO_Code에 대한 Updater를 재실행합니다.' })
    testInitiator(@Param('ISO_Code', UpperCasePipe) ISO_Code: string) { // launcher 입력받기
        return this.updaterService.testGeneralInitiate(ISO_Code);}

}
