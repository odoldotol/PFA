import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { FinancialAssetService } from "./financialAsset.service";
import {
  GlobalThrottlerGuard,
  TempKeyGuard
} from "src/common/guard";
import { UpperCasePipe } from "src/common/pipe";
import { RenewExchangeBodyDto } from "./dto";
import { FinancialAssetCore } from "src/common/interface";
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

  /**
   * 이 api 는 마켓서버가 새로운 FinancialAsset 을 DB 에 추가하도록 만들 수 있음.
   * 그것을 클라이언트가 (202 상태코드로든지) 알 필요가 있을까?
   */
  @Post('inquire/:ticker')
  @HttpCode(HttpStatus.OK)
  @Api_inquire()
  public async inquire(
    @Param('ticker', UpperCasePipe) ticker: string,
    @Query('id') id?: string,
  ): Promise<FinancialAssetCore> {
    return this.financialAssetSrv.inquire(ticker, id);
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
  ): Promise<void> {
    return this.financialAssetSrv.renewExchange(
      {
        isoCode: ISO_Code,
        marketDate: body.marketDate,
      },
      body.priceTupleArr
    );
  }

}
