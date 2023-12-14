import { Exchange } from "../database/exchange/exchange.entity";

export const mockKoreaExchange: Exchange = {
  isoCode: 'XKRX',
  isoTimezoneName: 'Asia/Seoul',
  marketDate: '2023-03-25',
};

export const mockNewYorkStockExchange: Exchange = {
  isoCode: "XNYS",
  isoTimezoneName: "America/New_York",
  marketDate: '2023-03-25',
};