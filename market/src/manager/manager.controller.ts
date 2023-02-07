import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Param, ParseArrayPipe, Patch, Post, Put, Query } from '@nestjs/common';
import { ManagerService } from './manager.service';
import { UpdaterService } from '../updater/updater.service';
import { ConfigExchangeDto } from './dto/configExchange.dto';
import { Status_priceRepository } from '../mongodb/repository/status_price.repository';
import { Config_exchangeRepository } from '../mongodb/repository/config_exchane.repository';
import { Yf_infoRepository } from '../mongodb/repository/yf-info.repository';

@Controller('manager')
export class ManagerController {

    constructor(
        private readonly managerService: ManagerService,
        private readonly updaterService: UpdaterService,
        private readonly yf_infoRepository: Yf_infoRepository,
        private readonly status_priceRepository: Status_priceRepository,
        private readonly config_exchangeRepository: Config_exchangeRepository,
        ) {}

    /**
     * ### DB 에 YF 식 심볼배열로 yf_info 생성해보고 그 작업의 결과를 알려주기
     */
    @Post('yf_info')
    @HttpCode(200)
    async createByTickerArr(@Body(new ParseArrayPipe({items:String})) tickerArr: string[]): Promise<object> {
        return await this.managerService.createByTickerArr(tickerArr);
    }

    /**
     * ### yf_info 조회
     */
    @Get('yf_info')
    async getAllYfInfo() {
        return await this.yf_infoRepository.getAll();
    }

    /**
     * ### status_price doc 모두 조회
     */
    @Get('status_price')
    async getAllStatusPrice() {
        return await this.status_priceRepository.findAll();
    }

    /**
     * ### price 조회
     * - ISO_Code 로 조회 => [ticker, price][]
     * - ticker 로 조회 => price
     */
    @Get('price')
    async getPrice(@Query('ISO_Code') ISO_Code?: string, @Query('ticker') ticker?: string) {
        if (ISO_Code && !ticker) {
            return await this.managerService.getPriceByISOcode(ISO_Code);
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
    async testInitiator(@Param('ISO_Code') ISO_Code: string) {
        return await this.updaterService.testGeneralInitiate(ISO_Code);
    }

    /**
     * ### create config_exchange
     */
    @Post('config_exchange')
    async createConfigExchange(@Body() body: ConfigExchangeDto) {
        return await this.config_exchangeRepository.create(body);
    }

}
