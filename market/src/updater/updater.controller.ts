import { Body, Controller, Get, HttpCode, Param, ParseArrayPipe, Post, Query, UseGuards } from '@nestjs/common';
import { UpdaterService } from './updater.service';
import { ApiTags } from '@nestjs/swagger';
import { UpperCasePipe } from 'src/common/pipe/upperCasePipe';
import { TempKeyGuard } from 'src/common/guard/key.guard';
import { ApiCommonResponse } from 'src/common/decorator/apiCommonResponse.decorator';
import { Api_initiator } from './decorator/api-initiator.decorator';
import { Api_initiateForce } from './decorator/api-initiateForce.decorator';

@Controller('updater')
@ApiTags('Updater')
@ApiCommonResponse()
export class UpdaterController {

    constructor(
        private readonly updaterService: UpdaterService
    ) {}

    // @Post('relaunch')
    // @HttpCode(200)
    // @UseGuards(TempKeyGuard)
    // @Api_initiator()
    // initiator() {
    //     return this.updaterService.initiator();}

    // // TODO: launcher Validation 추가하기
    // @Post('force-initiate/:ISO_Code')
    // @HttpCode(200)
    // @UseGuards(TempKeyGuard)
    // @Api_initiateForce()
    // initiateForce(@Param('ISO_Code', UpperCasePipe) ISO_Code: string, @Query('launcher') launcher: LogPriceUpdate["launcher"]) {
    //     return this.updaterService.initiateForce(ISO_Code, launcher);} // 메서드 전환중
    
    // @Get('schedule')
    // getAllSchedule() {
    //     return this.updaterService.getAllSchedule();
    // }

}
