import { TExchangeCore } from "src/common/type/exchange.type";
import { TExchangeConfigArrProvider } from "../provider/exchangeConfigArr.provider";
import * as F from "@fxts/core";

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

export const mockExchageConfigArr: TExchangeConfigArrProvider = makeMappedArray(
  n => ({
    ISO_Code: mockISO_Code[n],
    ISO_TimezoneName: mockISO_TimezoneName[n],
    market: mockMarket[n]
  })
);

export const mockExchangeCoreArr: TExchangeCore[] = makeMappedArray(
  n => ({
    ISO_Code: mockISO_Code[n],
    ISO_TimezoneName: mockISO_TimezoneName[n],
    marketDate: mockMarketDate[n]
  })
);