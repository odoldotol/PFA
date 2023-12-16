import { Currency, Ticker } from "src/common/interface";
import { FinancialAsset } from "src/database/financialAsset/financialAsset.entity";

// Todo: API npm, Refac: Product API 리팩터링과 함께 이중 배열이 아닌 객체(FinancialAsset 혹은 부분집합 객체)의 배열로 바꾸자.
export class GetPriceByExchangeResponse
extends Array<[
  Ticker,
  number,
  Currency | "INDEX"
]>
{
  constructor(
    financialAssetArr: FinancialAsset[]
  ) {
    super(financialAssetArr.length);
    financialAssetArr.forEach((ele, i) => (this[i] = [
      ele.symbol,
      ele.regularMarketLastClose,
      ele.quoteType === "INDEX" ? "INDEX" : ele.currency
    ]));
  }

}
