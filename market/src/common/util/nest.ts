import { Type } from "@nestjs/common";
import { joinUnderbar } from ".";

export const isType = (value: any): value is Type => {
  if (
    value &&
    value instanceof Function &&
    value.constructor === Function &&
    value.prototype?.constructor === value
  ) {
    return true;
  } else {
    return false;
  }
};

export const buildLoggerContext = (
  ...arr: Array<string | Type>
): string => joinUnderbar(...arr.map(
  item => typeof item !== "string" ? item.name : item
));

export const buildInjectionToken = joinUnderbar;