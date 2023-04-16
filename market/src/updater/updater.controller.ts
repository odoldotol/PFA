import { Body, Controller, HttpCode, Param, ParseArrayPipe, Post } from '@nestjs/common';
import { UpdaterService } from './updater.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpperCasePipe } from '@common/pipe/upperCasePipe';
import { ApiCommonResponse } from '@common/decorator/apiCommonResponse.decorator';

@Controller('updater')
@ApiTags('Updater')
@ApiCommonResponse()
export class UpdaterController {

    constructor(
        private readonly updaterService: UpdaterService,) {}

    @Post('asset')
    @HttpCode(200)
    @ApiBody({ type: [String], description: 'ticker 배열', required: true, examples: { 
        '1': { summary: "기본", description: "ticker로 이루어진 배열입니다.",  value: ['aapl', 'msft']},
        '2': { summary: "대소문자", description: "대소문자를 구별하지 않으며 중복된 티커는 무시됩니다. 위 예제는 [ 'AAPL' ] 과 결과적으로 동일합니다.",  value: ['aapl', 'AAPL', 'aApL', 'Aapl']},
        '3': { summary: "국가코드", description: "미국 이외 국가 거래소의 티커는 예시와 같이 국가코드를 포함해야합니다.", value: ['005930.KS', 'ADS.DE']},}})
    @ApiOperation({ summary: 'Create Assets', description: 'ticker배열로 Assets를 생성합니다.' })
    addAssets (@Body(UpperCasePipe, new ParseArrayPipe({ items: String })) tickerArr: string[]) {
        return this.updaterService.addAssets(tickerArr);}

    @Post('initiate')
    @HttpCode(200)
    @ApiOperation({ summary: 'Re-Launch All Updater', description: '모든 Updater를 재실행합니다.' })
    Initiator() {
        return this.updaterService.initiator();}

    // TODO: 제거하고 진짜 제너럴 이니시에이터 실행하는 api 열기
    @Post('test_generalInitiate/:ISO_Code')
    @HttpCode(200)
    @ApiOperation({ summary: 'Re-Launch Updater<진>', description: '해당 ISO_Code에 대한 Updater를 재실행합니다.' })
    testInitiator(@Param('ISO_Code', UpperCasePipe) ISO_Code: string) { // launcher 입력받기
        return this.updaterService.testGeneralInitiate(ISO_Code);}

}
