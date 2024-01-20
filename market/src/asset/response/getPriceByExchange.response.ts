import { Currency, FinancialAssetCore, Ticker } from "src/common/interface";

// Todo: API npm, Refac: Product API 리팩터링과 함께 이중 배열이 아닌 객체(FinancialAsset 혹은 부분집합 객체)의 배열로 바꾸자.
export class GetPriceByExchangeResponse
extends Array<[
  Ticker,
  number,
  Currency | "INDEX"
]>
{
  constructor(
    financialAssetArr: FinancialAssetCore[]
  ) {
    super(financialAssetArr.length);
    financialAssetArr.forEach((ele, i) => (this[i] = [
      ele.symbol,
      ele.regularMarketLastClose,
      ele.quoteType === "INDEX" ? "INDEX" : ele.currency
    ]));
  }

}
