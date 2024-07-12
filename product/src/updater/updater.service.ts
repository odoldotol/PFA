import {
  Injectable,
  Logger,
  OnModuleInit
} from "@nestjs/common";
import { MarketApiService } from "src/marketApi";
import { MarketDateService } from "src/marketDate";
import { FinancialAssetService } from "src/financialAsset";
import { UpdatePriceByExchangeBodyDto } from "./dto/updatePriceByExchangeBody.dto";
import * as F from '@fxts/core';

@Injectable()
export class UpdaterService
  implements OnModuleInit
{
  private readonly logger = new Logger(UpdaterService.name);

  constructor(
    private readonly marketApiSrv: MarketApiService,
    private readonly marketDateSrv: MarketDateService,
    private readonly financialAssetSrv: FinancialAssetService,
  ) {}

  async onModuleInit(): Promise<void> {

    // TODO: 각 업데이트 Asset이 해당 Exchange 에 속한게 맞는지 검사하고 있지 않다. 이거 문제될 가능성 있는지 찾아봐.
    await F.pipe(
      this.marketApiSrv.fetchAllSpDoc(),
      F.toAsync,
      F.reject(this.marketDateSrv.isUptodate.bind(this.marketDateSrv)),
      F.peek(e => this.marketDateSrv.updateOrCreate(
        e.isoCode,
        e.marketDate
      )),
      F.peek(async e => this.financialAssetSrv.updateOrDelete(
        e.isoCode,
        e.marketDate,
        await this.marketApiSrv.fetchPriceByISOcode(e.isoCode)
      )),
      F.each(e => this.logger.verbose(`${e.isoCode} : Updated`))
    );
  }

  /**
   * #### redis 트렌젝션이 필요한가?
   * 업데이트 중 financialAssetService 에서 inquire 하면 불필요한 marketapi 이용과 캐시 업데이트가 발생할 수 있음.
   * 하지만 성능적인 이슈 이외의 문제는 없는 것으로 판단됨.
   * 각 거래소의 자산에 대한 캐시 업데이트에 소요되는 시간은 하루 한번 찰나의 순간이며, 일단은 이정도 짧은 시간동안의 성능저하는 무시하고 추후에 좀 더 자세히 검토하고 개선하자.
   * 하지만 개래소가 마감되는 시간에 업데이트가 이루어지는 서비스 성격상, 이때 서비스 이용도 높을 가능성이 크기 때문에, 이와 관련된 성능개선은 중요하다고 판단됨.
   * - 새로운 연결로 redis 트렌젝션을 이용하던가,
   * - 업데이트중인 자산에 대한 inquire 를 기존 일괄처리 로직에 편승하여 잠시 시연시키는 방법도 업데이트 중인 Ticker 에 대한 inquire 만 막기에 좋아보임. (메서드를 락)
   *    - 각 Ticker 에 대한 옵저버블을 만들기(nodejs 18 성능검사에서 다수의 옵저버블 처리 성능이 생각보다 별로임) 보다는 하나의 프로미스로 업데이트중인 모든 Ticker 에 대한 메서드 호출을 지연시키는 것이 더 효율적일것임.
   *    - 왜냐하면 업데이트하는 Ticker 들 중 일부만이 업데이트와 동시에 inquire 될 것이기 때문에, 각각의 솔루션을 두어 대체하기보다는, 단지 지연시키고 업데이트 이후에 조회하도록 하는것이 좋음.
   * 
   * @todo 업데이트도중 financialAssetService.inquire 동시성 성능 개선.
   */
  public async updatePriceByExchange(
    ISO_Code: string,
    body: UpdatePriceByExchangeBodyDto
  ) {
    await this.marketDateSrv.update(
      ISO_Code,
      body.marketDate
    );
    await this.financialAssetSrv.updateOrDelete(
      ISO_Code,
      body.marketDate,
      body.priceArrs
    );
    this.logger.verbose(`${ISO_Code} : Updated`)
  }

}
