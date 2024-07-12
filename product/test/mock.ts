import {
  ExchangeCore,
  ExchangeIsoCode,
  FinancialAssetCore,
  PriceTuple,
  Ticker
} from "src/common/interface";
import {
  mockAppleTicker,
  mockSamsungTicker
} from "src/mock";

const mockEquity = 'EQUITY';

export const mockUsdCurrency = 'USD';
const mockKrwCurrency = 'KRW';

export const mockApplePrice = 185.27000427246094;
const mockSamsungPrice = 85000;

export const mockNewYorkStockExchangeIsoCode = 'XNYS';
const mockKoreaExchangeIsoCode = 'XKRX';

const mockNewYorkStockExchangeFromMarket: ExchangeCore = {
  "isoCode": mockNewYorkStockExchangeIsoCode,
  "marketDate": "2023-06-26",
  "isoTimezoneName": "America/New_York",
};
const mockKoreaExchangeFromMarket: ExchangeCore = {
  "isoCode": mockKoreaExchangeIsoCode,
  "marketDate": "2023-06-26",
  "isoTimezoneName": "Asia/Seoul",
};

const mockAppleAssetFromMarket: FinancialAssetCore = {
  "symbol": mockAppleTicker,
  "quoteType": mockEquity,
  "shortName": "Apple Inc.",
  "longName": "Apple Inc.",
  "exchange": mockNewYorkStockExchangeIsoCode,
  "currency": mockUsdCurrency,
  "regularMarketLastClose": mockApplePrice,
  "regularMarketPreviousClose": null,
  "marketDate": mockNewYorkStockExchangeFromMarket.marketDate
};
const mockSamsungAssetFromMarket: FinancialAssetCore = {
  "symbol": mockSamsungTicker,
  "quoteType": mockEquity,
  "shortName": "SamsungElec",
  "longName": "Samsung Electronics Co., Ltd.",
  "exchange": mockKoreaExchangeIsoCode,
  "currency": mockKrwCurrency,
  "regularMarketLastClose": mockSamsungPrice,
  "regularMarketPreviousClose": null,
  "marketDate": mockKoreaExchangeFromMarket.marketDate
};

const mockApplePriceTuple: PriceTuple = [
  mockAppleTicker,
  mockApplePrice,
  null
];
const mockSamsungPriceTuple: PriceTuple = [
  mockSamsungTicker,
  mockSamsungPrice,
  null
];

export const mockExchangesFromMarket: ExchangeCore[] = [
  mockNewYorkStockExchangeFromMarket,
  mockKoreaExchangeFromMarket,
];

export const mockAssetsFromMarketMap
: Map<Ticker, FinancialAssetCore>
= new Map([
  [mockAppleTicker, mockAppleAssetFromMarket],
  [mockSamsungTicker, mockSamsungAssetFromMarket],
]);

export const mockPriceTuplesFromMarketMap
: Map<ExchangeIsoCode, PriceTuple[]>
= new Map([
  [mockNewYorkStockExchangeIsoCode, [
    mockApplePriceTuple
  ]],
  [mockKoreaExchangeIsoCode, [
    mockSamsungPriceTuple
  ]],
]);