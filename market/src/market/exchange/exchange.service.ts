import { Market_Exchange } from "./class/exchange";
import {
  CoreExchange,
  ExchangeIsoCode,
  YfInfo
} from "src/common/interface";

export class Market_ExchangeService {

  private readonly exchangeMap: Map<ExchangeIsoCode, Market_Exchange>;

  constructor(
    exchangeProviderArr: Market_Exchange[]
  ) {
    this.exchangeMap = new Map(exchangeProviderArr.map(exchangeProvider => [
      exchangeProvider.isoCode,
      exchangeProvider
    ]));
  }

  public getOne(isoCode: ExchangeIsoCode): Market_Exchange;
  public getOne(coreExchange: CoreExchange): Market_Exchange;
  public getOne(arg: ExchangeIsoCode | CoreExchange): Market_Exchange {
    const isoCode = typeof arg === "string" ? arg : arg.isoCode;
    return this.exchangeMap.get(isoCode)!;
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
  public findOneByYfInfo(yfInfo: YfInfo): Market_Exchange | null {
    return this.getAll()
    .find(exchange => exchange.isoTimezoneName === yfInfo.exchangeTimezoneName) || null;
  }

}
