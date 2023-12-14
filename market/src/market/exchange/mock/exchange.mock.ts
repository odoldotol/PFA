import * as F from "@fxts/core";
import { ConfigExchange } from "src/common/interface";

export type MockCoreExchange = {
  isoCode: string
  isoTimezoneName: string
  marketDate: string
};

const COUNT = 2;

const makeMappedArray = <T>(fn: (n: number) => T) => {
  return  F.pipe(
    F.range(COUNT),
    F.map(fn),
    F.toArray
  );
};

const makeNumberingStrArray = (str: string) => {
  return makeMappedArray(n => `${str}${n}`);
};

const mockISO_Code = makeNumberingStrArray("ISO_Code");
const mockISO_TimezoneName = makeNumberingStrArray("ISO_TimezoneName");
const mockMarket = makeNumberingStrArray("market");
const mockMarketDate = makeNumberingStrArray(new Date().toISOString());

export const mockExchageConfigArr: ConfigExchange[] = makeMappedArray(
  n => ({
    ISO_TimezoneName: mockISO_TimezoneName[n],
    market: mockMarket[n]
  })
);

export const mockExchangeCoreArr: MockCoreExchange[] = makeMappedArray(
  n => ({
    isoCode: mockISO_Code[n],
    isoTimezoneName: mockISO_TimezoneName[n],
    marketDate: mockMarketDate[n]
  })
);

export const MOCK_CONFIG_EXCHANGES: Record<string, ConfigExchange> = (()=>{
  const result: Record<string, ConfigExchange> = {};
  mockExchageConfigArr.forEach((config, i) => {
    result[mockISO_Code[i]] = config;
  });
  return result;
})();