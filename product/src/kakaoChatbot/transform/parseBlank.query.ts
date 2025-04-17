import { TransformFnParams } from "class-transformer";

/**
 * 맨앞 공백 제거
 * 맨뒤 공백제거
 * 사이 공백 2개 이상이면 1개로 대체
 * 줄바꿈은 공백으로 대체
 */
export const parseBlank
: (params: TransformFnParams) => any
= (params) => {
  return (params.value as string)
  .replace(/^\s+|\s+$/g, '')
  .replace(/\s{2,}/g, ' ')
  .replace(/\n/g, ' ');
};