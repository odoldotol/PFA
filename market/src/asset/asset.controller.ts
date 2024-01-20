import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseArrayPipe,
  Post,
  Res,
  Version
} from "@nestjs/common";
import { Response } from 'express';
import { ApiTags } from "@nestjs/swagger";
import { AccessorService } from "./service/accessor.service";
import { SubscriberService } from "./service/subscriber.service";
import {
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

  @Version('1.1')
  @Post('price/get/:ISO_Code')
  @HttpCode(HttpStatus.OK)
  getPrice(
    @Param('ISO_Code', UpperCasePipe) isoCode: ExchangeIsoCode
  ): Promise<GetPriceByExchangeResponse> {
    return this.getPriceByExchange(isoCode);
  }

  @Version('1.1')
  @Post('price/inquire/:ticker')
  inquirePrice(
    @Param('ticker', UpperCasePipe) ticker: Ticker,
    @Res() response: Response
  ): Promise<void> {
    return this.getPriceByTicker(ticker, response);
  }

  @Post('inquire/:ticker')
  async inquire(
    @Param('ticker', UpperCasePipe) ticker: Ticker,
    @Res() response: Response
  ): Promise<void> {
    let body = await this.accessorSrv.getFinancialAsset(ticker);
    if (body) {
      response.status(HttpStatus.OK);
    } else {
      body = await this.accessorSrv.subscribeAssetAndGet(ticker);
      response.status(HttpStatus.CREATED);
    }
    response.send(body);
  }


  @Post('subscribe')
  @Api_subscribeAssets()
  async subscribeAssets(
    @Body(UpperCasePipe, new ParseArrayPipe({ items: String })) tickerArr: Ticker[],
    @Res() response: Response
  ): Promise<void> {
    const body = await this.subscribeerSrv.subscribeAssets(tickerArr);
    if (body.assets.length === 0) {
      response.status(HttpStatus.OK)
    }
    response.send(body);
  }

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
  async getPriceByTicker(
    @Param('ticker', UpperCasePipe) ticker: Ticker,
    @Res() response: Response
  ): Promise<void> {
    let body: GetPriceByTickerResponse;
    const asset = await this.accessorSrv.getFinancialAsset(ticker);
    if (asset) {
      body = new GetPriceByTickerResponse(asset);
      response.status(HttpStatus.OK);
    } else {
      body = new GetPriceByTickerResponse(
        await this.accessorSrv.subscribeAssetAndGet(ticker)
      );
      response.status(HttpStatus.CREATED);
    }
    response.send(body)
  }

}
