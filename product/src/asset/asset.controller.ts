import {
  Controller,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UseGuards
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Api_inquirePrice } from "./decorator/api-inquirePrice.decorator";
import { Response } from "express";
import { GlobalThrottlerGuard } from "src/common/guard";
import { UpperCasePipe } from "src/common/pipe";
import { AssetService } from "./asset.service";

@Controller('asset')
@UseGuards(GlobalThrottlerGuard)
@ApiTags('Asset')
export class AssetController {

  constructor(
    private readonly assetSrv: AssetService
  ) {}

  @Post('price/inquire/:ticker')
  @Api_inquirePrice()
  async inquirePrice(
    @Res() response: Response,
    @Param('ticker', UpperCasePipe) ticker: string,
    @Query('id') id?: string,
  ): Promise<void> {
    const inquirePriceResult = await this.assetSrv.inquirePrice(ticker, id);
    
    if (inquirePriceResult.created) {
      response.status(HttpStatus.CREATED);
    } else {
      response.status(HttpStatus.OK);
    }

    response.send(inquirePriceResult.data);
  }

}
