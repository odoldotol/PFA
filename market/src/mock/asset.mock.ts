import { FinancialAsset } from "src/common/class/financialAsset";

export const mockSamsungElec: FinancialAsset = {
  symbol: "005930.KS",
  quoteType: "EQUITY",
  quote_type: "EQUITY",
  shortName: "SamsungElec",
  short_name: "SamsungElec",
  longName: "Samsung Electronics Co., Ltd.",
  long_name: "Samsung Electronics Co., Ltd.",
  exchange: "XKRX",
  currency: "KRW",
  regularMarketLastClose: 100000,
  regular_market_last_close: 100000
};

export const mockApple: FinancialAsset = {
  symbol: "AAPL",
  quoteType: "EQUITY",
  quote_type: "EQUITY",
  shortName: "Apple Inc.",
  short_name: "Apple Inc.",
  longName: "Apple Inc.",
  long_name: "Apple Inc.",
  exchange: "XNYS",
  currency: "USD",
  regularMarketLastClose: 200,
  regular_market_last_close: 200
};

export const mockUsaTreasuryYield10y: FinancialAsset = {
  symbol: "^TNX",
  quoteType: "INDEX",
  quote_type: "INDEX",
  shortName: "CBOE Interest Rate 10 Year T No",
  short_name: "CBOE Interest Rate 10 Year T No",
  longName: "Treasury Yield 10 Years",
  long_name: "Treasury Yield 10 Years",
  exchange: "XNYS",
  currency: "USD",
  regularMarketLastClose: 4.5,
  regular_market_last_close: 4.5
};