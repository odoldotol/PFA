import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UseGuards
} from "@nestjs/common";
import { Response } from "express";
import { ApiTags } from "@nestjs/swagger";
import { FinancialAssetService } from "./financialAsset.service";
import {
  GlobalThrottlerGuard,
  TempKeyGuard
} from "src/common/guard";
import { UpperCasePipe } from "src/common/pipe";
import { RenewExchangeBodyDto } from "./dto";
import {
  Api_inquire,
  Api_renewExchange,
} from "./decorator";

@Controller('financialasset')
@UseGuards(GlobalThrottlerGuard)
@ApiTags('FinancialAsset')
export class FinancialAssetController {

  constructor(
    private readonly financialAssetSrv: FinancialAssetService
  ) {}

  @Post('inquire/:ticker')
  @Api_inquire()
  public async inquire(
    @Res() response: Response,
    @Param('ticker', UpperCasePipe) ticker: string,
    @Query('id') id?: string,
  ): Promise<void> {
    const inquirePriceResult = await this.financialAssetSrv.inquire(ticker, id);
    
    if (inquirePriceResult.created) {
      response.status(HttpStatus.CREATED);
    } else {
      response.status(HttpStatus.OK);
    }

    response.send(inquirePriceResult.data);
  }

  @Post('renew/:ISO_Code')
  @HttpCode(HttpStatus.OK)
  @UseGuards(TempKeyGuard)
  @Api_renewExchange()
  public renewExchange(
    @Param('ISO_Code')
    ISO_Code: string,
    @Body(UpperCasePipe)
    body: RenewExchangeBodyDto
  ) {
    return this.financialAssetSrv.renewExchange(
      ISO_Code,
      body.marketDate,
      body.priceTupleArr
    );
  }

}
