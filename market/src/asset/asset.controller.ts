import { Body, Controller, HttpCode, Param, ParseArrayPipe, Post } from "@nestjs/common";
import { UpperCasePipe } from "src/common/pipe/upperCasePipe";
import { AssetService } from "./asset.service";

@Controller('asset')
export class AssetController {

  constructor(
    private readonly assetSrv: AssetService
  ) {}

  @Post('exchange/:ISO_Code')
  @HttpCode(200)
  getPriceByExchange(@Param('ISO_Code', UpperCasePipe) ISO_Code: string) {
    return this.assetSrv.getPriceByExchange(ISO_Code);
  }

  @Post('price/ticker/:ticker')
  @HttpCode(200)
  getPriceByTicker(@Param('ticker', UpperCasePipe) ticker: string) {
    return this.assetSrv.getPriceByTicker(ticker);
  }

  @Post()
  @HttpCode(200)
  addAssets(@Body(UpperCasePipe, new ParseArrayPipe({ items: String })) tickerArr: string[]) {
      return this.assetSrv.addAssets(tickerArr);
  }

}