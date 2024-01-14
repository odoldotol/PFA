import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  UseGuards
} from '@nestjs/common';
import { MarketService } from './market.service';
import { ApiTags } from '@nestjs/swagger';
import { TempKeyGuard } from 'src/common/guard/key.guard';
import { UpdatePriceByExchangeBodyDto } from './dto/updatePriceByExchangeBody.dto';
import { ApiCommonResponse } from 'src/common/decorator/apiCommonResponse.decorator';
import { Api_updatePriceByExchange } from './decorator/api-updatePriceByExchange.decorator';
import { UpperCasePipe } from '../common/pipe/upperCasePipe';

@Controller('market')
@ApiTags('Market')
@ApiCommonResponse()
export class MarketController {

  constructor(
    private readonly marketService: MarketService
  ) {}

  @Post('update/price/exchange/:ISO_Code')
  @HttpCode(200)
  @UseGuards(TempKeyGuard)
  @Api_updatePriceByExchange()
  updatePriceByExchange(
    @Param('ISO_Code') ISO_Code: string,
    @Body(UpperCasePipe) body: UpdatePriceByExchangeBodyDto) {
    return this.marketService.updatePriceByExchange(ISO_Code, body);
  }

}
