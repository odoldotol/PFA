import { FinancialAsset } from "../financialAsset.entity";

export const mockSamsungElec: FinancialAsset = {
  symbol: "005930.KS",
  quoteType: "EQUITY",
  shortName: "SamsungElec",
  longName: "Samsung Electronics Co., Ltd.",
  exchange: "XKRX",
  currency: "KRW",
  regularMarketLastClose: 100000
};

export const mockApple: FinancialAsset = {
  symbol: "AAPL",
  quoteType: "EQUITY",
  shortName: "Apple Inc.",
  longName: "Apple Inc.",
  exchange: "XNYS",
  currency: "USD",
  regularMarketLastClose: 200
};

export const mockUsaTreasuryYield10y: FinancialAsset = {
  symbol: "^TNX",
  quoteType: "INDEX",
  shortName: "CBOE Interest Rate 10 Year T No",
  longName: "Treasury Yield 10 Years",
  exchange: "XNYS",
  currency: "USD",
  regularMarketLastClose: 4.5
};