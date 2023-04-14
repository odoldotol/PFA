import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Param, ParseArrayPipe, Patch, Post, Put, Query, UseGuards, Version } from '@nestjs/common';
import { ManagerService } from './manager.service';
import { UpdaterService } from '../updater/updater.service';
import { ConfigExchangeDto } from './dto/configExchange.dto';
import { UpperCasePipe } from '../pipe/upperCasePipe';
import { CreateAssetsDto } from './dto/createAssets.dto';
import { KeyGuard } from './guard/key.guard';

@Controller()
@UseGuards(KeyGuard)
export class ManagerController {

    constructor(
        private readonly managerService: ManagerService,
        private readonly updaterService: UpdaterService) {}

    @Post('asset')
    @HttpCode(200)
    createAssets (@Body(UpperCasePipe) body: CreateAssetsDto) {
        return this.updaterService.createAssetByTickerArr(body.tickerArr);} // Refac: addAsset

    @Post('price')
    @HttpCode(200)
    getPrice(@Body(UpperCasePipe) body: {ISO_Code?: string, ticker?: string}) {
        return this.managerService.getPrice(body);}

    @Post('updater/initiate')
    Initiator() {
        return this.updaterService.initiator();}

    @Post('config_exchange')
    createConfigExchange(@Body() body: ConfigExchangeDto) {
        return this.managerService.createConfigExchange(body);}

    // TODO: 제거하고 진짜 제너럴 이니시에이터 실행하는 api 열기
    @Post('updater/test_generalInitiate/:ISO_Code')
    testInitiator(@Param('ISO_Code', UpperCasePipe) ISO_Code: string) {
        return this.updaterService.testGeneralInitiate(ISO_Code);}

}
