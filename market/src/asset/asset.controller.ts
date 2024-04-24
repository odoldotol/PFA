import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseArrayPipe,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Response } from 'express';
import { ApiTags } from "@nestjs/swagger";
import { GlobalThrottlerGuard } from "src/common/guard";
import {
  AccessorService,
  SubscriberService
} from "./service";
import {
  GetPriceByExchangeResponse,
} from "./response";
import { ExchangeIsoCode, Ticker } from "src/common/interface";
import { 
  Api_getPriceByExchange,
  Api_inquireAsset,
  Api_subscribeAssets,
} from "./decorator";
import { UpperCasePipe } from "src/common/pipe";

@Controller('asset')
@UseGuards(GlobalThrottlerGuard)
@ApiTags('Asset')
export class AssetController {

  constructor(
    private readonly accessorSrv: AccessorService,
    private readonly subscribeerSrv: SubscriberService,
  ) {}

  @Post('price/get/:ISO_Code')
  @HttpCode(HttpStatus.OK)
  @Api_getPriceByExchange()
  getPrice(
    @Param('ISO_Code', UpperCasePipe) isoCode: ExchangeIsoCode
  ): Promise<GetPriceByExchangeResponse> {
    return this.accessorSrv.getPriceByExchange(isoCode);
  }

  @Post('inquire/:ticker')
  @Api_inquireAsset()
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

}
