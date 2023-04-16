import { Body, Controller, HttpCode, Param, ParseArrayPipe, Post, Query } from '@nestjs/common';
import { UpdaterService } from './updater.service';
import { ApiTags } from '@nestjs/swagger';
import { UpperCasePipe } from '@common/pipe/upperCasePipe';
import { ApiCommonResponse } from '@common/decorator/apiCommonResponse.decorator';
import { Api_addAssets } from './decorator/api-addAssets.decorator';
import { Api_initiator } from './decorator/api-initiator.decorator';
import { Api_initiateForce } from './decorator/api-initiateForce.decorator';

@Controller('updater')
@ApiTags('Updater')
@ApiCommonResponse()
export class UpdaterController {

    constructor(
        private readonly updaterService: UpdaterService,) {}

    @Post('asset')
    @HttpCode(200)
    @Api_addAssets()
    addAssets (@Body(UpperCasePipe, new ParseArrayPipe({ items: String })) tickerArr: string[]) {
        return this.updaterService.addAssets(tickerArr);}

    @Post('relaunch')
    @HttpCode(200)
    @Api_initiator()
    initiator() {
        return this.updaterService.initiator();}

    // TODO: launcher Validation 추가하기
    @Post('force-initiate/:ISO_Code/:launcher')
    @HttpCode(200)
    @Api_initiateForce()
    initiateForce(@Param('ISO_Code', UpperCasePipe) ISO_Code: string, @Param('launcher') launcher: LogPriceUpdate["launcher"]) {
        return this.updaterService.initiateForce(ISO_Code, launcher);} // 메서드 전환중

}
