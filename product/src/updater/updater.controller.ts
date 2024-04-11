import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { TempKeyGuard } from "src/common/guard/key.guard";
import { UpperCasePipe } from "src/common/pipe";
import { Api_updatePriceByExchange } from "./decorator/api-updatePriceByExchange.decorator";
import { UpdatePriceByExchangeBodyDto } from "./dto/updatePriceByExchangeBody.dto";
import { MarketDateParser } from "./pipe/marketDateParser";
import { UpdaterService } from "./updater.service";

@Controller('updater')
@ApiTags('Updater')
export class UpdaterController {

  constructor(
    private readonly updaterStv: UpdaterService
  ) {}

  @Post('price/:ISO_Code')
  @HttpCode(HttpStatus.OK)
  @UseGuards(TempKeyGuard)
  @Api_updatePriceByExchange()
  updatePriceByExchange(
    @Param('ISO_Code')
    ISO_Code: string,
    @Body(UpperCasePipe, MarketDateParser)
    body: UpdatePriceByExchangeBodyDto
  ) {
    return this.updaterStv.updatePriceByExchange(ISO_Code, body);
  }

}
