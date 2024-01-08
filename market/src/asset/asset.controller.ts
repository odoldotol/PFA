import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseArrayPipe,
  Post,
  Res
} from "@nestjs/common";
import { Response } from 'express';
import { ApiTags } from "@nestjs/swagger";
import { AccessorService } from "./service/accessor.service";
import { SubscriberService } from "./service/subscriber.service";
import {
  SubscribeAssetsResponse,
  GetPriceByExchangeResponse,
  GetPriceByTickerResponse
} from "./response";
import { ExchangeIsoCode, Ticker } from "src/common/interface";
import { 
  Api_getPriceByExchange,
  Api_subscribeAssets,
  Api_getPriceByTicker
} from "./decorator";
import { UpperCasePipe } from "src/common/pipe/upperCasePipe";

@Controller('asset')
@ApiTags('Asset')
export class AssetController {

  constructor(
    private readonly accessorSrv: AccessorService,
    private readonly subscribeerSrv: SubscriberService,
  ) {}

  @Post('price/exchange/:ISO_Code')
  @HttpCode(HttpStatus.OK)
  @Api_getPriceByExchange()
  getPriceByExchange(
    @Param('ISO_Code', UpperCasePipe) isoCode: ExchangeIsoCode
  ): Promise<GetPriceByExchangeResponse> {
    return this.accessorSrv.getPriceByExchange(isoCode);
  }

  @Post('price/ticker/:ticker')
  @Api_getPriceByTicker()
  async getPrice(
    @Param('ticker', UpperCasePipe) ticker: Ticker,
    @Res() response: Response
  ): Promise<void> {
    let body: GetPriceByTickerResponse;
    let status: HttpStatus;
    const asset = await this.accessorSrv.getPrice(ticker);
    if (asset) {
      body = new GetPriceByTickerResponse(asset);
      status = HttpStatus.OK;
    } else {
      body = new GetPriceByTickerResponse(
        await this.accessorSrv.subscribeAssetAndGetPrice(ticker)
      );
      status = HttpStatus.CREATED;
    }
    response
    .status(status)
    .send(body)
  }

  @Post('subscribe')
  @HttpCode(HttpStatus.OK)
  @Api_subscribeAssets()
  subscribeAssets(
    @Body(UpperCasePipe, new ParseArrayPipe({ items: String })) tickerArr: Ticker[]
  ): Promise<SubscribeAssetsResponse> {
    return this.subscribeerSrv.subscribeAssets(tickerArr);
  }

}