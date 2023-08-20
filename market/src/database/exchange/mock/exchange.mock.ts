import { Exchange } from "../exchange.entity";

export const mockKoreaExchange: Exchange = {
  ISO_Code: 'XKRX',
  ISO_TimezoneName: 'Asia/Seoul',
  marketDate: '2023-03-25',
};

export const mockNewYorkStockExchange: Exchange = {
  ISO_Code: "XNYS",
  ISO_TimezoneName: "America/New_York",
  marketDate: '2023-03-25',
};