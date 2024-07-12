import {
  Controller,
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
import { GlobalThrottlerGuard } from "src/common/guard";
import { UpperCasePipe } from "src/common/pipe";
import { Api_inquire } from "./decorator";

@Controller('financialasset')
@UseGuards(GlobalThrottlerGuard)
@ApiTags('FinancialAsset')
export class FinancialAssetController {

  constructor(
    private readonly financialAssetSrv: FinancialAssetService
  ) {}

  @Post('inquire/:ticker')
  @Api_inquire()
  async inquirePrice(
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

}
