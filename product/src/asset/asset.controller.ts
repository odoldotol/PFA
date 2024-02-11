import {
  Controller,
  HttpStatus,
  Param,
  Post,
  Query,
  Res
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Api_inquirePrice } from "./decorator/api-inquirePrice.decorator";
import { Response } from "express";
import { UpperCasePipe } from "src/common/pipe/upperCasePipe";
import { AssetService } from "./asset.service";

@Controller('asset')
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
  ) {
    const inquirePriceResult = await this.assetSrv.inquirePrice(ticker, id);
    
    if (inquirePriceResult.created) {
      response.status(HttpStatus.CREATED);
    } else {
      response.status(HttpStatus.OK);
    }

    response.send(inquirePriceResult.data);
  }

}
