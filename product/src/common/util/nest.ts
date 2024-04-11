import { Type } from "@nestjs/common";

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
}