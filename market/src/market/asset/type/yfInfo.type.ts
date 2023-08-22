import { TYfPrice } from './';

export type TYfInfo = Readonly<{
  quoteType: string
  currency: string
  shortName: string
  longName?: string
  market?: string
  exchange?: string
  exchangeTimezoneName: string
  exchangeTimezoneShortName?: string
  [key: string]: string|number|null|boolean|undefined
}> & TYfPrice;