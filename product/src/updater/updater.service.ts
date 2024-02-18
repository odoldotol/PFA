import {
  Injectable,
  Logger,
  OnModuleInit
} from "@nestjs/common";
import { MarketApiService } from "src/marketApi/marketApi.service";
import { MarketDate } from "src/common/class/marketDate.class";
import { UpdatePriceByExchangeBodyDto } from "./dto/updatePriceByExchangeBody.dto";
import { MarketDateService } from "src/database/marketDate/marketDate.service";
import { PriceService } from "src/database/price/price.service";
import * as F from '@fxts/core';

@Injectable()
export class UpdaterService
  implements OnModuleInit
{
  private readonly logger = new Logger(UpdaterService.name);

  constructor(
    private readonly marketApiSrv: MarketApiService,
    private readonly marketDateSrv: MarketDateService,
    private readonly priceSrv: PriceService,
  ) {}

  async onModuleInit(): Promise<void> {

    // TODO: 각 업데이트 Asset이 해당 Exchange 에 속한게 맞는지 검사하고 있지 않다. 이거 문제될 가능성 있는지 찾아봐.
    await F.pipe(
      this.marketApiSrv.fetchAllSpDoc(),
      F.toAsync,
      F.reject(this.marketDateSrv.isUptodate.bind(this.marketDateSrv)),
      F.peek(e => this.marketDateSrv.updateOrCreate(
        e.isoCode,
        MarketDate.fromSpDoc(e)
      )),
      F.peek(async e => this.priceSrv.updateOrDelete(
        e.isoCode,
        MarketDate.fromSpDoc(e),
        await this.marketApiSrv.fetchPriceByISOcode(e.isoCode)
      )),
      F.each(e => this.logger.verbose(`${e.isoCode} : Updated`))
    );
  }

  public updatePriceByExchange(
    ISO_Code: string,
    body: UpdatePriceByExchangeBodyDto
  ) {
    return this.priceSrv.updateOrDelete(
      ISO_Code,
      body.marketDate,
      body.priceArrs
    );
  }

}
