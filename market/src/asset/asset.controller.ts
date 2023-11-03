import { Body, Controller, HttpCode, Param, ParseArrayPipe, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UpperCasePipe } from "src/common/pipe/upperCasePipe";
import { AssetService } from "./asset.service";
import { 
  Api_getPriceByExchange,
  Api_addAssets,
  Api_getPriceByTicker
} from "./decorator";

@Controller('asset')
@ApiTags('Asset')
export class AssetController {

  constructor(
    private readonly assetSrv: AssetService
  ) {}

  @Post('exchange/:ISO_Code')
  @HttpCode(200)
  @Api_getPriceByExchange()
  getPriceByExchange(@Param('ISO_Code', UpperCasePipe) ISO_Code: string) {
    return this.assetSrv.getPriceByExchange(ISO_Code);
  }

  @Post('price/ticker/:ticker')
  @HttpCode(200)
  @Api_getPriceByTicker()
  getPriceByTicker(@Param('ticker', UpperCasePipe) ticker: string) {
    return this.assetSrv.getPriceByTicker(ticker);
  }

  @Post()
  @HttpCode(200)
  @Api_addAssets()
  addAssets(@Body(UpperCasePipe, new ParseArrayPipe({ items: String })) tickerArr: string[]) {
    return this.assetSrv.addAssets(tickerArr);
  }

}