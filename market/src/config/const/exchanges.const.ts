// https://www.iso20022.org/market-identifier-codes
// https://github.com/gerrymanoim/exchange_calendars#calendars

export type TExchangeConfig = {
  market: string;
  ISO_Code: string;
  country?: string;
  exchange_website?: string;
  ISO_TimezoneName: string;
}

export const exchangeConfigArr: TExchangeConfig[] = [
  {
    "market":"BMF Bovespa",
    "ISO_Code":"BVMF",
    "country":"Brazil",
    "exchange_website":"http://www.b3.com.br/en_us/",
    "ISO_TimezoneName":"America/Sao_Paulo"
  },
  {
    "market":"Frankfurt Stock Exchange",
    "ISO_Code":"XFRA",
    "country":"Germany",
    "exchange_website":"http://en.boerse-frankfurt.de/",
    "ISO_TimezoneName":"Europe/Berlin"
  },
  {
    "market":"London Stock Exchange",
    "ISO_Code":"XLON",
    "country":"England",
    "exchange_website":"https://www.londonstockexchange.com/",
    "ISO_TimezoneName":"Europe/London"
  },
  {
    "market":"New York Stock Exchange",
    "ISO_Code":"XNYS",
    "country":"USA",
    "exchange_website":"https://www.nyse.com/index",
    "ISO_TimezoneName":"America/New_York"
  },
  {
    "market":"Shanghai Stock Exchange",
    "ISO_Code":"XSHG",
    "country":"China",
    "exchange_website":"http://www.sse.com.cn/",
    "ISO_TimezoneName":"Asia/Shanghai"
  },
  {
    "market":"Tokyo Stock Exchange",
    "ISO_Code":"XTKS",
    "country":"Japan",
    "exchange_website":"https://www.jpx.co.jp/english/",
    "ISO_TimezoneName":"Asia/Tokyo"
  },
  {
    "market":"Toronto Stock Exchange",
    "ISO_Code":"XTSE",
    "country":"Canada",
    "exchange_website":"https://www.tsx.com/",
    "ISO_TimezoneName":"America/Toronto"
  },
  {
    "market":"yahoo finance CCC",
    "ISO_Code":"XCCC",
    "ISO_TimezoneName":"UTC"
  },
  {
    "market":"Korea Exchange",
    "ISO_Code":"XKRX",
    "country":"South Korea",
    "exchange_website":"http://global.krx.co.kr",
    "ISO_TimezoneName":"Asia/Seoul"
  },
  {
    "market":"Hong Kong Stock Exchange",
    "ISO_Code":"XHKG",
    "country":"Hong Kong",
    "exchange_website":"https://www.hkex.com.hk/?sc_lang=en",
    "ISO_TimezoneName":"Asia/Hong_Kong"
  }
]
