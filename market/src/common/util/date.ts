import {
  Day,
  Month
} from ".";

export const getLogStyleStr = (date: Date): string => {
  return date.toLocaleString("en-GB", { timeZone: "Asia/Seoul" });
};

/**
 * 
 * @param timeZone 'Asia/Seoul', 'America/New_York', ... , default is 'utc'
 */
export const getISOYmdStr = (
  date: Date,
  timeZone: string = 'utc'
): ISOYmd => {
  return new Intl.DateTimeFormat('en-GB', {timeZone}).format(date)
  .split('/')
  .reverse()
  .join('-') as ISOYmd;
};

/**
 * @returns 0 or Positive integer
 */
export const calculateRemainingMs = (date: Date): number => {
  const result = date.getTime() - new Date().getTime();
  return 0 < result ? result : 0;
};

/**
 * @returns 1 or Positive integer
 * 
 * it cannot be elapsed 0 ms.
 * if calculated 0ms, return 1.
 */
export const calculateElapsedMs = (date: Date): number => {
  const result = new Date().getTime() - date.getTime();
  return 0 < result ? result :
  result === 0 ? 1 :
  0;
};

export type ISOYmd = `${number}-${Month}-${Day}`;