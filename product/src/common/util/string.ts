import { Type } from "@nestjs/common";
import { Currency } from "../interface";

const joinUnderbar = (...stringArr: string[]): string => stringArr.join("_");

export const buildLoggerContext = (
  ...arr: Array<string | Type>
): string => joinUnderbar(...arr.map(
  item => typeof item !== "string" ? item.name : item
));

export const buildInjectionToken = joinUnderbar;

export const dedupStrIter = (
  iterable: Iterable<string>
): Iterable<string> => new Set(iterable).values();

// Todo: Currency, CurrencySign Enum?
type CurrencySign = "$" | "€" | "¥" | "£" | "₩" | "";
export const getCurrencySign = (
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