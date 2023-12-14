import { ConfigExchanges } from "src/common/interface";
import { YAHOO_FINANCE_CCC_EXCHANGE_ISO_CODE } from "./yahooFinance.const";

/*
- CONFIG_EXCHANGES2 의 Key 에서 ExchangeIsoCode 타입을 얻음.
- ExchangeIsoCode 를 사용하여 ConfigExchanges 타입을 만듦.
- 타입의 직간접적 참조를 피하면서 ConfigExchanges 로 CONFIG_EXCHANGES2 의 타입검사를 하기위해
  새로운 상수 CONFIG_EXCHANGES 를 선언하고 ConfigExchanges 타입으로 CONFIG_EXCHANGES2 를 할당함.
*/

/**
 * #### Description:
 * - Key: ISO_Code
 * - Value: ConfigExchange
 * - YahooFinance_update_margin - milliseconds.
 * 
 * #### References:
 * - https://www.iso20022.org/market-identifier-codes
 * - https://github.com/gerrymanoim/exchange_calendars#calendars
 */
export const CONFIG_EXCHANGES2 = {
  "BVMF": {
    "market":"BMF Bovespa",
    "country":"Brazil",
    "exchange_website":"http://www.b3.com.br/en_us/",
    "ISO_TimezoneName":"America/Sao_Paulo"
  },
  "XFRA": {
    "market":"Frankfurt Stock Exchange",
    "country":"Germany",
    "exchange_website":"http://en.boerse-frankfurt.de/",
    "ISO_TimezoneName":"Europe/Berlin"
  },
  "XLON": {
    "market":"London Stock Exchange",
    "country":"England",
    "exchange_website":"https://www.londonstockexchange.com/",
    "ISO_TimezoneName":"Europe/London"
  },
  "XNYS": {
    "market":"New York Stock Exchange",
    "country":"USA",
    "exchange_website":"https://www.nyse.com/index",
    "ISO_TimezoneName":"America/New_York",
    "yahooFinance_update_margin": 59000,
  },
  "XSHG": {
    "market":"Shanghai Stock Exchange",
    "country":"China",
    "exchange_website":"http://www.sse.com.cn/",
    "ISO_TimezoneName":"Asia/Shanghai"
  },
  "XTKS": {
    "market":"Tokyo Stock Exchange",
    "country":"Japan",
    "exchange_website":"https://www.jpx.co.jp/english/",
    "ISO_TimezoneName":"Asia/Tokyo"
  },
  "XTSE": {
    "market":"Toronto Stock Exchange",
    "country":"Canada",
    "exchange_website":"https://www.tsx.com/",
    "ISO_TimezoneName":"America/Toronto",
    "yahooFinance_update_margin": 59000,
  },
  [YAHOO_FINANCE_CCC_EXCHANGE_ISO_CODE]: {
    "market":"yahoo finance CCC",
    "ISO_TimezoneName":"UTC",
    "yahooFinance_update_margin": 10,
  },
  "XKRX": {
    "market":"Korea Exchange",
    "country":"South Korea",
    "exchange_website":"http://global.krx.co.kr",
    "ISO_TimezoneName":"Asia/Seoul"
  },
  "XHKG": {
    "market":"Hong Kong Stock Exchange",
    "country":"Hong Kong",
    "exchange_website":"https://www.hkex.com.hk/?sc_lang=en",
    "ISO_TimezoneName":"Asia/Hong_Kong"
  },
  "CMES": {
    "market":"Chicago Mercantile Exchange",
    "country":"USA",
    "exchange_website":"https://www.cmegroup.com/",
    "ISO_TimezoneName":"America/Chicago"
  },
};

const CONFIG_EXCHANGES: ConfigExchanges = CONFIG_EXCHANGES2;

export default CONFIG_EXCHANGES;