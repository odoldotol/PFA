import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Param, ParseArrayPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { ManagerService } from './manager.service';
import { UpdaterService } from '../updater/updater.service';
import { ConfigExchangeDto } from '../dto/configExchange.dto';
import { DBRepository } from '../database/database.repository';
import { UpperCasePipe } from './pipe/upperCasePipe';

@Controller('manager')
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
    createAssets(@Body(new ParseArrayPipe({items:String}), UpperCasePipe) tickerArr: string[]): Promise<object> {
        return this.updaterService.createAssetByTickerArr(tickerArr);
    }

    /**
     * ###
     */
    @Get('asset')
    getAllAssetsInfo() {
        return this.dbRepo.getAllAssetsInfo();
    }

    /**
     * ### status_price doc 모두 조회
     */
    @Get('status_price')
    getAllStatusPrice() {
        return this.dbRepo.getAllStatusPrice();
    }

    /**
     * ### price 조회
     * - ISO_Code 로 조회 => [ticker, price][]
     * - ticker 로 조회 => price
     */
    @Get('price')
    getPrice(@Query('ISO_Code', UpperCasePipe) ISO_Code?: string, @Query('ticker', UpperCasePipe) ticker?: string) {
        if (ISO_Code && !ticker) {
            return this.dbRepo.getPriceByISOcode(ISO_Code);
        } else if (ticker && !ISO_Code) {
            return this.managerService.getPriceByTicker(ticker);
        } else {
            throw new BadRequestException('ISO_Code or ticker must be provided')
        }
    }

    /**
     * ### Log_priceUpdate 조회
     */
    @Get('price_update_log')
    getUpdateLog(@Query('ISO_Code', UpperCasePipe) ISO_Code?: string, @Query('limit') limit?: number) {
        return this.dbRepo.getUpdateLog(ISO_Code, limit);
    }

    /**
     * ### run initator
     */
    @Post('updater/initiate')
    Initiator() {
        return this.updaterService.initiator();
    }

    /**
     * ### tester
     */
    @Post('dev/updater/test_generalInitiate/:ISO_Code')
    testInitiator(@Param('ISO_Code', UpperCasePipe) ISO_Code: string) {
        return this.updaterService.testGeneralInitiate(ISO_Code);
    }

    /**
     * ### create config_exchange
     */
    @Post('config_exchange')
    createConfigExchange(@Body() body: ConfigExchangeDto) {
        return this.dbRepo.createConfigExchange(body);
    }

}
