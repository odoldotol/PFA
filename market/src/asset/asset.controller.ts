import {
  Body,
  Controller,
  HttpCode,
  Param,
  ParseArrayPipe,
  Post
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AccessorService } from "./service/accessor.service";
import { AdderService } from "./service/adder.service";
import {
  AddAssetsResponse,
  GetPriceByExchangeResponse,
  GetPriceByTickerResponse
} from "./response";
import { ExchangeIsoCode, Ticker } from "src/common/interface";
import { 
  Api_getPriceByExchange,
  Api_addAssets,
  Api_getPriceByTicker
} from "./decorator";
import { UpperCasePipe } from "src/common/pipe/upperCasePipe";

@Controller('asset')
@ApiTags('Asset')
export class AssetController {

  constructor(
    private readonly accessorSrv: AccessorService,
    private readonly adderSrv: AdderService,
  ) {}

  @Post('price/exchange/:ISO_Code')
  @HttpCode(200)
  @Api_getPriceByExchange()
  getPriceByExchange(
    @Param('ISO_Code', UpperCasePipe) isoCode: ExchangeIsoCode
  ): Promise<GetPriceByExchangeResponse> {
    return this.accessorSrv.getPriceByExchange(isoCode);
  }

  @Post('price/ticker/:ticker')
  @HttpCode(200)
  @Api_getPriceByTicker()
  getPriceByTicker(
    @Param('ticker', UpperCasePipe) ticker: Ticker
  ): Promise<GetPriceByTickerResponse> {
    return this.accessorSrv.getPriceByTicker(ticker);
  }

  @Post()
  @HttpCode(200)
  @Api_addAssets()
  addAssets(
    @Body(UpperCasePipe, new ParseArrayPipe({ items: String })) tickerArr: Ticker[]
  ): Promise<AddAssetsResponse> {
    return this.adderSrv.addAssets(tickerArr);
  }

}