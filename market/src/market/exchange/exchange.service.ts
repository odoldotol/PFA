import { Market_Exchange } from "./class/exchange";
import { TYfInfo } from "../type";
import { TExchangeCore } from "src/common/type";

// Todo: 1 차 리팩터링 후, 여전히 이 레이어의 역할이 스스로 분명하지 않음. 업데이트 동작과 관련해서 명확한 분리|통합이 필요함.
export class Market_ExchangeService {

  private readonly exchangeMap: Map<Market_Exchange["ISO_Code"], Market_Exchange>;

  constructor(
    exchangeProviderArr: Market_Exchange[]
  ) {
    this.exchangeMap = new Map(exchangeProviderArr.map(exchangeProvider => [
      exchangeProvider.ISO_Code,
      exchangeProvider
    ]));
  }

  // Todo: 확실히 Exchange 를 반환하는 상황에서 호출했을때 ! Assertion 없이 undefined 가 아니라는 것을 타입스크립트가 알 수 있도록 하기 (config 레벨에서 ISO_Code 에 대한 타입정의를 할까?)
  public getOne(ISO_Code: Market_Exchange["ISO_Code"]): Market_Exchange | undefined;
  public getOne(exchangeCore: TExchangeCore): Market_Exchange | undefined;
  public getOne(arg: Market_Exchange["ISO_Code"] | TExchangeCore) {
    const ISO_Code = typeof arg === "string" ? arg : arg.ISO_Code;
    return this.exchangeMap.get(ISO_Code);
  }

  public getAll() {
    return [...this.exchangeMap.values()];
  }

  /**
   * ### YfInfo 로 Exchange 를 찾기
   * #### 현제 방식
   * - 하나의 Timezone 에 복수의 Exchange 가 존재하지 않기 때문에 Timezone 과 Exchange 를 1:1 매칭하여 구별.
   * - 만약, 예외 발견되면 이 방식은 무용지물.
   * #### 권장 방식
   * - YahooFinance 에서 Exchange 를 구별하는 방식과 ISO_Code 를 매칭.
   * - 이것과 관련한 설정파일이 필요해지는 번거로움이 예상됨.
   */
  public findOneByYfInfo(yfInfo: TYfInfo) {
    return this.getAll().find(exchange => exchange.ISO_TimezoneName === yfInfo.exchangeTimezoneName);
  }

}
