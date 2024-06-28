/* Todo: MonetaryValue 클레스 만들기
통화 단위를 가져야함
통화간 계산이 가능해야함 (환율을 가져야 함, 환율을 선택할 수 있어야함. 예를들면 원달러 환율이 기관별 상황별로 다르다.)
다양한 경제지표, 인덱스의 표현이 가능해야함
여러가지 폼으로 변환하여 출력, 표현이 가능해야함
*/

import { Currency } from "../interface";

export const to2Decimal = (value: number): number => {
  return Math.round((value + Number.EPSILON) * 100) / 100;
};

// Todo: Currency, CurrencySign Enum?
type CurrencySign = "$" | "€" | "¥" | "£" | "₩" | "";
export const currencyToSign = (
  currency: Currency,
): CurrencySign | "" => {
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