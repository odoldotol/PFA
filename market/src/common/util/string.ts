import { Type } from "@nestjs/common";

const joinUnderbar = (...stringArr: string[]): string => stringArr.join("_");

export const buildLoggerContext = (...arr: Array<string | Type>) => {
  const strArr = arr.map((item) => {
    if (typeof item !== "string") return item.name;
    return item;
  });
  return joinUnderbar(...strArr);
};

export const buildInjectionToken = joinUnderbar;
