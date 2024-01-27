import { Type } from "@nestjs/common";

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