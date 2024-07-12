import {
  FinancialAssetCore,
  PriceTuple
} from "src/common/interface";

export class GetPriceByExchangeResponse
  extends Array<PriceTuple>
{
  constructor(
    financialAssetArr: FinancialAssetCore[]
  ) {
    super(financialAssetArr.length);
    financialAssetArr.forEach((ele, i) => (this[i] = [
      ele.symbol,
      ele.regularMarketLastClose,
      ele.regularMarketPreviousClose,
    ]));
  }

}
