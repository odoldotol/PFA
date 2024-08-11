/* Todo: MonetaryValue 클레스 만들기
통화 단위를 가져야함
통화간 계산이 가능해야함 (환율을 가져야 함, 환율을 선택할 수 있어야함. 예를들면 원달러 환율이 기관별 상황별로 다르다.)
다양한 경제지표, 인덱스의 표현이 가능해야함
여러가지 폼으로 변환하여 출력, 표현이 가능해야함

켄트 벡의 TDD 의 Money 예제가 좋은 예시가 될 수 있음.
*/

import { Currency } from "../interface";
import { to2Decimal } from "./number";

/**
 * Money 규칙(ThousandsSeparator 콤마, 2 Decimal, 통화기호)를 따르는 문자열 반환.
 */
export const getMoneyStr = (
  value: number,
  currency: Currency
): string => formatWithThousandsSeparator(to2Decimal(value)) + currencyToSign(currency);

/**
 * 숫자를 3자리마다 콤마를 찍어서 문자열로 반환합니다.
 */
const formatWithThousandsSeparator = (num: number): string =>
  num.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");

// Todo: Currency, CurrencySign Enum?
const currencyToSign = (
  currency: Currency,
): CurrencySign => {
  switch (currency) {
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    case 'JPY':
      return '¥';
    case 'GBP':
      return '£';
    case 'CNY':
      return '¥';
    case 'KRW':
      return '₩';
    default:
      return "";
  }
};

type CurrencySign = "$" | "€" | "¥" | "£" | "₩" | "";