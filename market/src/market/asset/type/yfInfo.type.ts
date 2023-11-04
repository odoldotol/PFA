import { TYfPrice } from './';

export type TYfInfo = Readonly<{
  quoteType: string
  currency: string
  shortName: string
  longName?: string
  market?: string
  exchangeName: string
  exchangeTimezoneName: string
  timezone: string
  [key: string]: any
}> & TYfPrice;