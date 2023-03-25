import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Param, ParseArrayPipe, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ManagerService } from './manager.service';
import { UpdaterService } from '../updater/updater.service';
import { ConfigExchangeDto } from './dto/configExchange.dto';
import { DBRepository } from '../database/database.repository';
import { UpperCasePipe } from './pipe/upperCasePipe';
import { CreateAssetsDto } from './dto/createAssets.dto';
import { KeyGuard } from './guard/key.guard';

@Controller('manager')
@UseGuards(KeyGuard)
export class ManagerController {

    constructor(
        private readonly managerService: ManagerService,
        private readonly updaterService: UpdaterService,
        private readonly dbRepo: DBRepository,
    ) {}

    /**
     * ### tickerArr 로 Assets 생성해보고 그 작업의 결과 반환
     */
    @Post('asset')
    @HttpCode(200)
    createAssets(@Body(UpperCasePipe) body: CreateAssetsDto) {
        return this.updaterService.createAssetByTickerArr(body.tickerArr);
    }

    @Post('read_asset')
    getAllAssetsInfo() {
        return this.dbRepo.readAllAssetsInfo();
    }

    @Post('read_status_price')
    getAllStatusPrice() {
        return this.dbRepo.readAllStatusPrice();
    }

    /**
     * ### price 조회
     * - ISO_Code 로 조회 => [ticker, price][]
     * - ticker 로 조회 => price
     */
    @Post('price')
    getPrice(@Body(UpperCasePipe) body: {ISO_Code?: string, ticker?: string}) {
        if (body.ISO_Code && !body.ticker) {
            return this.dbRepo.readPriceByISOcode(body.ISO_Code);
        } else if (body.ticker && !body.ISO_Code) {
            return this.managerService.getPriceByTicker(body.ticker);
        } else {
            throw new BadRequestException('Either ISO_Code or ticker must be provided')
        }
    }

    @Post('read_price_update_log')
    getUpdateLog(@Query('ISO_Code', UpperCasePipe) ISO_Code?: string, @Query('limit') limit?: number) {
        return this.dbRepo.readUpdateLog(ISO_Code, limit);
    }

    @Post('updater/initiate')
    Initiator() {
        return this.updaterService.initiator();
    }

    @Post('dev/updater/test_generalInitiate/:ISO_Code')
    testInitiator(@Param('ISO_Code', UpperCasePipe) ISO_Code: string) {
        return this.updaterService.testGeneralInitiate(ISO_Code);
    }

    @Post('config_exchange')
    createConfigExchange(@Body() body: ConfigExchangeDto) {
        return this.dbRepo.createConfigExchange(body);
    }

}
