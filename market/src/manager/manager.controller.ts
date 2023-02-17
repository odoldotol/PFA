import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Param, ParseArrayPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { ManagerService } from './manager.service';
import { UpdaterService } from '../updater/updater.service';
import { ConfigExchangeDto } from '../dto/configExchange.dto';
import { DBRepository } from '../database/database.repository';
import { UpperCasePipe } from './pipe/uppercasePipe';

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
    async createAssets(@Body(new ParseArrayPipe({items:String}), UpperCasePipe) tickerArr: string[]): Promise<object> {
        return await this.updaterService.createAssetByTickerArr(tickerArr);
    }

    /**
     * ###
     */
    @Get('asset')
    async getAllAssetsInfo() {
        return await this.dbRepo.getAllAssetsInfo();
    }

    /**
     * ### status_price doc 모두 조회
     */
    @Get('status_price')
    async getAllStatusPrice() {
        return await this.dbRepo.getAllStatusPrice();
    }

    /**
     * ### price 조회
     * - ISO_Code 로 조회 => [ticker, price][]
     * - ticker 로 조회 => price
     */
    @Get('price')
    async getPrice(@Query('ISO_Code', UpperCasePipe) ISO_Code?: string, @Query('ticker', UpperCasePipe) ticker?: string) {
        if (ISO_Code && !ticker) {
            return await this.dbRepo.getPriceByISOcode(ISO_Code);
        } else if (ticker && !ISO_Code) {
            return await this.managerService.getPriceByTicker(ticker);
        } else {
            throw new BadRequestException('ISO_Code or ticker must be provided')
        }
    }

    /**
     * ### run initator
     */
    @Post('updater/initiate')
    async Initiator() {
        return await this.updaterService.initiator();
    }

    /**
     * ### tester
     */
    @Post('dev/updater/test_generalInitiate/:ISO_Code')
    async testInitiator(@Param('ISO_Code', UpperCasePipe) ISO_Code: string) {
        return await this.updaterService.testGeneralInitiate(ISO_Code);
    }

    /**
     * ### create config_exchange
     */
    @Post('config_exchange')
    async createConfigExchange(@Body() body: ConfigExchangeDto) {
        return await this.dbRepo.createConfigExchange(body);
    }

}
